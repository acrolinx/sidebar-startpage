import {Component} from 'preact';
import {a, createPreactFactory} from "../utils/preact";
import {getLocale, getTranslation} from "../localization";
import {InitParameters} from "../acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";

export type OpenWindowFunction = (url: string) => void;

interface HelpLinkProps {
  openWindow: OpenWindowFunction;
  initParameters: InitParameters;
}

export function getLocalizedDefaultHelpLink(): string {
  return (getLocale() === 'de') ? HELP_LINK_URLS.de : HELP_LINK_URLS.en;
}

export const HELP_LINK_URLS = {
  en: 'https://support.acrolinx.com/hc/en-us/articles/203845751',
  de: 'https://support.acrolinx.com/hc/de/articles/203845751'
};


class HelpLink extends Component<HelpLinkProps, {}> {
  render() {
    const props = this.props;
    return a({
      className: 'icon-help',
      title: getTranslation().serverSelector.tooltip.openHelp,
      onClick: (event: Event) => {
        event.preventDefault();
        event.stopPropagation(); // Prevent triggering the click event on the containing element.
        props.openWindow(props.initParameters.helpUrl || getLocalizedDefaultHelpLink());
      }, href: '#'
    });
  }
}

export const helpLink = createPreactFactory(HelpLink);
