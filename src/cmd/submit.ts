import axios from 'axios';
import FormData from 'form-data';
import { print } from 'graphql';
import { gql } from 'graphql-tag';
import ora from 'ora';

import cfg from '@cfg';
import { getConfig, getToken, title, toTable, zipFiles } from '@utils';

/**
 * GraphQL create submission mutation.
 */
const CREATE_SUBMISSION = gql`
  mutation CreateSubmission($input: CreateSubmissionInput!, $file: Upload!) {
    submission: createSubmission(input: $input, file: $file) {
      id
      status
      sourceCode
      createdAt
      updatedAt

      assignment {
        id
        name
        createdAt
        updatedAt
      }
    }
  }
`;

/**
 * Submit command.
 */
export async function submit() {
  title('Submit');

  const spinner = ora({ text: 'Creating submission...', color: 'yellow' });
  spinner.start();

  try {
    const config = getConfig();
    const token = getToken();
    const operations = JSON.stringify({
      query: print(CREATE_SUBMISSION),
      variables: {
        input: {
          assignmentId: config.assignmentId
        },
        file: null
      }
    });
    const map = JSON.stringify({
      file: ['variables.file']
    });

    const formData = new FormData();
    formData.append('operations', operations);
    formData.append('map', map);
    formData.append('file', zipFiles());

    const request = await axios.post(cfg.apiURL, formData, {
      headers: {
        ...formData.getHeaders(),
        Cookie: token
      }
    });

    const { errors, data } = request.data;

    if (errors) {
      for (const error of errors) {
        spinner.fail(error.message);
        console.log();
        process.exit(1);
      }
    }

    const submit = data?.submission || {};
    const assignment = { ...(submit?.assignment || {}) };
    delete submit.assignment;

    spinner.succeed('Submission created successfully.');
    console.log();
    console.log('Assignment:');
    console.log();
    console.log(toTable(assignment));
    console.log();
    console.log('Submit:');
    console.log();
    console.log(toTable(submit));
  } catch (error) {
    console.log(error);
    spinner.fail('Could not create submission.');
    process.exit(1);
  }
}
