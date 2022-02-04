import axios from 'axios';
import { print } from 'graphql';
import { gql } from 'graphql-tag';
import ora from 'ora';
import { table } from 'table';

import cfg from '@cfg';
import { box, getConfig, getToken, init, title, toTable } from '@utils';

/**
 * GraphQL create submission mutation.
 */
const GET_SUBMISSION = gql`
  query GetSubmission($input: GetSubmissionInput!) {
    submission: getSubmission(input: $input) {
      id
      status
      score
      output
      sourceCode
      createdAt
      updatedAt

      tests: testCases {
        name
        score
        output
      }

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
 * Get last submission command.
 */
export async function getLastSubmission() {
  init();
  title('Get Last Submission');

  const spinner = ora({ text: 'Getting last submission...', color: 'yellow' });
  spinner.start();

  try {
    const config = getConfig();
    const token = getToken();
    const request = await axios.post(
      cfg.apiURL,
      {
        query: print(GET_SUBMISSION),
        variables: {
          input: {
            assignmentId: config.assignmentId
          }
        }
      },
      {
        headers: {
          Cookie: token
        }
      }
    );

    const { errors, data } = request.data;

    if (errors) {
      for (const error of errors) {
        spinner.fail(error.message);
        console.log();
        process.exit(1);
      }
    }

    if (!data?.submission) {
      spinner.fail('No submission yet.');
      process.exit(0);
    }

    const submit = data?.submission || {};
    const tests = submit?.tests || [];
    const output = submit.output || '';
    // const testsOutput = submit?.testsOutput || [];
    const assignment = { ...(submit?.assignment || {}) };
    delete submit.assignment;
    delete submit.tests;
    delete submit.testsOutput;
    delete submit.output;

    spinner.succeed('Last submission fetched successfully.');
    console.log();
    console.log('Assignment:');
    console.log();
    console.log(toTable(assignment));
    console.log();
    console.log('Submit:');
    console.log();
    console.log(toTable(submit));

    if (output) {
      console.log(box('General Output', output));
    }

    if (tests.length > 0) {
      console.log();
      console.log('Tests:');
      console.log();
      const data: any[] = [];
      tests.forEach((test: any) => {
        data.push([test.name, test.score, test.output]);
      });
      console.log(table(data));
    }
  } catch (error) {
    spinner.fail('Could not get last submission.');
    process.exit(1);
  }
}
