import axios from 'axios';
import { parse, serialize } from 'cookie';
import { print } from 'graphql';
import { gql } from 'graphql-tag';
import ora from 'ora';
import prompts from 'prompts';

import cfg from '@cfg';
import { saveToken, title, toTable } from '@utils';

/**
 * GraphQL sign in mutation.
 */
const SIGN_IN = gql`
  mutation SignIn($input: SignInInput!) {
    user: signIn(input: $input) {
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
 * Sign in command.
 */
export async function signIn() {
  title('Sign In');

  const input = await prompts(
    [
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

  const spinner = ora({ text: 'Signing in...', color: 'yellow' });
  spinner.start();

  try {
    const request = await axios.post(cfg.apiURL, {
      query: print(SIGN_IN),
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

    const headers = request.headers;
    const setCookie = headers['set-cookie'] || [];
    const cookie = parse(setCookie[0]);
    const token = serialize(cfg.cookie, cookie[cfg.cookie]);
    const user = data?.user || {};

    saveToken(token);

    spinner.succeed('User signed in successfully.');
    console.log();
    console.log('Authenticated User:');
    console.log();
    console.log(toTable(user));
  } catch (error) {
    spinner.fail('Could not sign in.');
    process.exit(1);
  }
}
