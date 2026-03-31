import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, locales } from './config';

export default getRequestConfig(async () => {
  // Detect locale from cookies, headers, or use default
  const cookieStore = await cookies();
  const headersList = await headers();

  let locale =
    cookieStore.get('NEXT_LOCALE')?.value ||
    headersList.get('accept-language')?.split(',')[0]?.split('-')[0] ||
    defaultLocale;

  // Ensure locale is valid
  if (!locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/libs/i18n/messages/${locale}.json`)).default,
  };
});
