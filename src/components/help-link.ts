import {Component} from 'preact';
import {createPreactFactory, a} from "../utils/preact";

export const HELP_LINK_URL = 'https://support.acrolinx.com/hc/en-us/articles/203845751';

export type OpenWindowFunction = (url: string) => void;

interface HelpLinkProps {
  openWindow: OpenWindowFunction;
}

class HelpLink extends Component<HelpLinkProps, {}> {
  render() {
    const props = this.props;
    return a({
      className: 'icon-help',
      onClick: (event: Event) => {
        event.preventDefault();
        props.openWindow(HELP_LINK_URL);
      }, href: '#'
    });
  }
}

export const helpLink = createPreactFactory(HelpLink);
