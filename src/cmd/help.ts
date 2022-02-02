import { title } from '@utils';

export function help() {
  title('Help');
  console.log(`  Usage:
    $ autograders <option>

  Options
    --sign-up                     Create a new user
    --resend-email-verification   Resend email verification token
    --verify-email                Verify user email
    --sign-in                     Authenticate user
    --forgot-password             Send reset password token
    --reset-password              Reset password
    --submit                      Create a submission
    --get-last-submit             Get last submission
    --get-best-submit             Get best submission
    --help, -h                    Print CLI help.

  Examples:
    $ autograders --sign-in
    $ autograders --submit
`);
}
