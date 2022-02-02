import axios from 'axios';
import { print } from 'graphql';
import { gql } from 'graphql-tag';
import ora from 'ora';
import prompts from 'prompts';

import cfg from '@cfg';
import { title, toTable } from '@utils';

/**
 * GraphQL reset password mutation.
 */
const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    user: resetPassword(input: $input) {
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
 * Reset password command.
 */
export async function resetPassword() {
  title('Reset Password');

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
      },
      {
        type: 'password',
        name: 'newPassword',
        message: 'New Password'
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

  const spinner = ora({ text: 'Resetting user password...', color: 'yellow' });
  spinner.start();

  try {
    const request = await axios.post(cfg.apiURL, {
      query: print(RESET_PASSWORD),
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

    spinner.succeed('User password changed succesfully.');
    console.log();
    console.log('Updated User:');
    console.log();
    console.log(toTable(user));
  } catch (error) {
    spinner.fail('Could not reset user password.');
    process.exit(1);
  }
}
