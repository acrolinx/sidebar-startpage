import {
  AcrolinxSidebar,
  InitParameters,
  SidebarConfiguration,
  CheckOptions,
  Check,
  InvalidDocumentPart,
  CheckedDocumentRange
} from "./acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";


export class ProxyAcrolinxSidebar implements AcrolinxSidebar {
  private _acrolinxSidebar: AcrolinxSidebar;
  private _serverAddress: string;
  private configureQueue: SidebarConfiguration[] = [];

  constructor(private initListener: (initParameters: InitParameters) => void) {
  }

  get serverAddress(): string {
    return this._serverAddress;
  }

  set serverAddress(value: string) {
    this._serverAddress = value;
  }

  get acrolinxSidebar(): AcrolinxSidebar {
    return this._acrolinxSidebar;
  }

  set acrolinxSidebar(sidebar: AcrolinxSidebar) {
    this._acrolinxSidebar = sidebar;
    while (this.configureQueue.length > 0) {
      this._acrolinxSidebar.configure(this.configureQueue.splice(0, 1)[0]);
    }
  }

  init(initParameters: InitParameters): void {
    this.initListener(initParameters);
  }

  configure(sidebarConfiguration: SidebarConfiguration): void {
    if (this.acrolinxSidebar) {
      this.acrolinxSidebar.configure(sidebarConfiguration);
    } else {
      this.configureQueue.push(sidebarConfiguration);
    }
  }

  checkGlobal(documentContent: string, options: CheckOptions): Check {
    return this.acrolinxSidebar.checkGlobal(documentContent, options);
  }

  onGlobalCheckRejected(): void {
    this.acrolinxSidebar.onGlobalCheckRejected();
  }

  invalidateRanges(invalidCheckedDocumentRanges: InvalidDocumentPart[]) {
    this.acrolinxSidebar.invalidateRanges(invalidCheckedDocumentRanges);
  }

  onVisibleRangesChanged(checkedDocumentRanges: CheckedDocumentRange[]) {
    return this.acrolinxSidebar.onVisibleRangesChanged(checkedDocumentRanges);
  }
}
