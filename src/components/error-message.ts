import {Component} from "preact";
import {createPreactFactory, div, textarea} from "../utils/preact";


export interface ErrorMessageProps {
  message: string;
  detailedMessage?: string;
}

interface ErrorMessageState {
  showDetails: boolean;
}


class ErrorMessageComponent extends Component<ErrorMessageProps, ErrorMessageState> {
  state = {
    showDetails: false
  };

  showErrorDetails = () => {
    this.setState({
      showDetails: true
    });
  }

  selectDetailMessage = (event: Event) => {
    event.preventDefault();
    const textArea = event.srcElement as HTMLTextAreaElement;
    textArea.select();
  }

  render() {
    const props = this.props;
    return div({className: 'errorMessage', },
      div({className: "errorMessageMain"}, props.message),
      this.props.detailedMessage ? div({
          className: 'detailedErrorSection'
        },
        div({className: 'detailsButton', onClick: this.showErrorDetails}, "DETAILS"),
        this.state.showDetails ? textarea({
          readOnly: true,
          onClick: this.selectDetailMessage,
          value: this.props.detailedMessage
        }) : []) : []);
  }
}

export const errorMessageComponent = createPreactFactory(ErrorMessageComponent);
