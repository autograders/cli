import arg from 'arg';

import { forgotPassword } from '@cmd/forgot-password';
import { getBestSubmission } from '@cmd/get-best-submission';
import { getLastSubmission } from '@cmd/get-last-submission';
import { help } from '@cmd/help';
import { resendEmailVerification } from '@cmd/resend-email-verification';
import { resetPassword } from '@cmd/reset-password';
import { signIn } from '@cmd/sign-in';
import { signUp } from '@cmd/sign-up';
import { submit } from '@cmd/submit';
import { verifyEmail } from '@cmd/verify-email';
import { init } from '@utils';

export async function cli() {
  try {
    const opts = arg({
      '--sign-up': Boolean,
      '--resend-email-verification': Boolean,
      '--verify-email': Boolean,
      '--sign-in': Boolean,
      '--forgot-password': Boolean,
      '--reset-password': Boolean,
      '--submit': Boolean,
      '--get-last-submit': Boolean,
      '--get-best-submit': Boolean,
      '--help': Boolean,
      '-h': Boolean
    });

    init();

    if (opts['--help'] || opts['-h']) {
      help();
    } else if (opts['--sign-up']) {
      await signUp();
    } else if (opts['--resend-email-verification']) {
      await resendEmailVerification();
    } else if (opts['--verify-email']) {
      await verifyEmail();
    } else if (opts['--sign-in']) {
      await signIn();
    } else if (opts['--forgot-password']) {
      await forgotPassword();
    } else if (opts['--reset-password']) {
      await resetPassword();
    } else if (opts['--submit']) {
      await submit();
    } else if (opts['--get-last-submit']) {
      await getLastSubmission();
    } else if (opts['--get-best-submit']) {
      await getBestSubmission();
    }
  } catch (error) {
    help();
  }
}
