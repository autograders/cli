import axios from 'axios';
import { print } from 'graphql';
import { gql } from 'graphql-tag';
import ora from 'ora';
import prompts from 'prompts';

import cfg from '@cfg';
import { title } from '@utils';

/**
 * GraphQL send token mutation.
 */
const SEND_TOKEN = gql`
  mutation SendToken($input: SendTokenInput!) {
    sendToken(input: $input)
  }
`;

/**
 * Resend email verification command.
 */
export async function resendEmailVerification() {
  title('Resend Email Verification');

  const input = await prompts(
    [
      {
        type: 'text',
        name: 'email',
        message: 'Email'
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

  const spinner = ora({
    text: 'Sending email verification token...',
    color: 'yellow'
  });

  spinner.start();

  try {
    const request = await axios.post(cfg.apiURL, {
      query: print(SEND_TOKEN),
      variables: {
        input: {
          ...input,
          type: 'VERIFY_EMAIL'
        }
      }
    });

    const { errors } = request.data;

    if (errors) {
      for (const error of errors) {
        spinner.fail(error.message);
        console.log();
        process.exit(1);
      }
    }

    spinner.succeed('Email verification token sent successfully!.');
  } catch (error) {
    console.log(error.response.data.errors);
    spinner.fail('Could not send email verification token.');
    process.exit(1);
  }
}
