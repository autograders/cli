import axios from 'axios';
import { print } from 'graphql';
import { gql } from 'graphql-tag';
import ora from 'ora';
import prompts from 'prompts';

import cfg from '@cfg';
import { title, toTable } from '@utils';

/**
 * GraphQL sign up mutation.
 */
const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    user: signUp(input: $input) {
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
 * Sign up command.
 */
export async function signUp() {
  title('Sign Up');

  const input = await prompts(
    [
      {
        type: 'text',
        name: 'firstName',
        message: 'First Name'
      },
      {
        type: 'text',
        name: 'lastName',
        message: 'Last Name'
      },
      {
        type: 'text',
        name: 'email',
        message: 'Email'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password'
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

  const spinner = ora({ text: 'Creating user...', color: 'yellow' });
  spinner.start();

  try {
    const request = await axios.post(cfg.apiURL, {
      query: print(SIGN_UP),
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

    spinner.succeed('User created successfully.');
    console.log();
    console.log('Created User:');
    console.log();
    console.log(toTable(user));
  } catch (error) {
    spinner.fail('Could not create user.');
    process.exit(1);
  }
}
