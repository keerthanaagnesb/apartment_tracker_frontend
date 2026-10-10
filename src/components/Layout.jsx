import { useBodyClass } from '../hooks/useLive';
import { themeFor } from '../api';
import Navbar from './Navbar';

/** Navbar + page container, coloured with the theme of the logged-in role. */
export default function Layout({ user, narrow, children }) {
  useBodyClass(themeFor(user));
  return (
    <>
      <Navbar user={user} />
      <main className={'page' + (narrow ? ' page-narrow' : '')}>{children}</main>
    </>
  );
}
