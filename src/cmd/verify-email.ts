import axios from 'axios';
import { print } from 'graphql';
import { gql } from 'graphql-tag';
import ora from 'ora';
import prompts from 'prompts';

import cfg from '@cfg';
import { title, toTable } from '@utils';

/**
 * GraphQL verify email mutation.
 */
const VERIFY_EMAIL = gql`
  mutation VerifyEmail($input: VerifyEmailInput!) {
    user: verifyEmail(input: $input) {
      id
      email
      firstName
      lastName
      isVerified
      isDeactivated
      isInstructor
      createdAt
      updatedAt
    }
  }
`;

/**
 * Verify email command.
 */
export async function verifyEmail() {
  title('Verify Email');

  const input = await prompts(
    [
      {
        type: 'text',
        name: 'email',
        message: 'Email'
      },
      {
        type: 'password',
        name: 'token',
        message: 'Token'
      }
    ],
    {
      onSubmit: () => {
        console.log();
      },
      onCancel: () => {
        process.exit(0);
      }
    }
  );

  const spinner = ora({ text: 'Verifying user email...', color: 'yellow' });
  spinner.start();

  try {
    const request = await axios.post(cfg.apiURL, {
      query: print(VERIFY_EMAIL),
      variables: { input }
    });

    const { errors, data } = request.data;

    if (errors) {
      for (const error of errors) {
        spinner.fail(error.message);
        console.log();
        process.exit(1);
      }
    }

    const user = data?.user || {};

    spinner.succeed('User email verified successfully.');
    console.log();
    console.log('Updated User:');
    console.log();
    console.log(toTable(user));
  } catch (error) {
    spinner.fail('Could not verify user email.');
    process.exit(1);
  }
}
