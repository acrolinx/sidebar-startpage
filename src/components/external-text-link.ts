import {Component} from 'preact';
import {createPreactFactory, a} from "../utils/preact";

export type OpenWindowFunction = (url: string) => void;

interface ExternalTextLinkProps {
  url: string;
  openWindow: OpenWindowFunction;
  text: string;
}

class ExternalTextLink extends Component<ExternalTextLinkProps, {}> {
  render() {
    const props = this.props;
    return a({
      className: 'externalTextLink',
      onClick: (event: Event) => {
        event.preventDefault();
        props.openWindow(props.url);
      }, href: '#'
    }, this.props.text);
  }
}

export const externalTextLink = createPreactFactory(ExternalTextLink);
