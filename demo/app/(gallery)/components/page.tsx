// /components — the component lab.
//
// In the (gallery) route group, not (frame): this page is chrome, and the thing
// under test renders in an iframe pointed at /component/<dir>, which IS in the
// frame group. That separation is the point — the component never shares a
// document with the lab's own styling, so nothing the lab does can flatter or
// break what you are looking at.
import Lab from './Lab';
import { components } from '../../../components.gen/manifests';
import { defaultTheme, themes } from '../../../components.gen/themes';

export const metadata = {
  title: 'Component lab — Kopla Kits',
  description:
    'Every advanced-components catalog entry at real widths, in every kit theme, with scripts on or off.',
};

export default function ComponentsPage() {
  return <Lab components={components} themes={themes} defaultTheme={defaultTheme} />;
}
