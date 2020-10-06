import React from 'react';

import {
  ConversationListItem,
  PropsData as ConversationListItemPropsType,
} from '../ConversationListItem';
import { PropsData as SearchResultsProps } from '../SearchResults';
import { debounce } from 'lodash';
import { cleanSearchTerm } from '../../util/cleanSearchTerm';
import { SearchOptions } from '../../types/Search';
import { LeftPane, RowRendererParamsType } from '../LeftPane';
import {
  SessionButton,
  SessionButtonColor,
  SessionButtonType,
} from './SessionButton';
import { AutoSizer, List } from 'react-virtualized';
import { validateNumber } from '../../types/PhoneNumber';
import { ConversationType } from '../../state/ducks/conversations';
import {
  SessionClosableOverlay,
  SessionClosableOverlayType,
} from './SessionClosableOverlay';
import { MainViewController } from '../MainViewController';
import { ToastUtils } from '../../session/utils';
import { ContactListItem } from '../ContactListItem';

export interface Props {
  isSecondaryDevice: boolean;
  openConversationInternal: (id: string, messageId?: string) => void;
}

interface State {
  showAddContactView: boolean;
  selectedTab: number;
  addContactRecipientID: string;
  pubKeyPasted: string;
}

export class LeftPaneWalletSection extends React.Component<Props, State> {

  public constructor(props: Props) {
    super(props);
    this.state = {
      showAddContactView: false,
      selectedTab: 0,
      addContactRecipientID: '',
      pubKeyPasted: '',
    };

    this.handleToggleOverlay = this.handleToggleOverlay.bind(this);
    this.handleOnAddContact = this.handleOnAddContact.bind(this);
    this.handleRecipientSessionIDChanged = this.handleRecipientSessionIDChanged.bind(
      this
    );
  }

  public componentWillUnmount() {
    this.setState({ addContactRecipientID: '' });
  }

  public renderHeader(): JSX.Element | undefined {
    const labels = ["Wallet"/*window.i18n('contactsHeader')*/];

    return LeftPane.RENDER_HEADER(
      labels,
      undefined,
      undefined,
      undefined,
      undefined
    );
  }

  public componentDidMount() {
    MainViewController.renderMessageView();
  }

  public componentDidUpdate() {
    MainViewController.renderMessageView();
  }

  public render(): JSX.Element {
    return (
      <div className="left-pane-contact-section">
        {this.renderHeader()}
        {this.state.showAddContactView
          ? this.renderClosableOverlay()
          : this.renderWallets()}
      </div>
    );
  }

  public renderRow = ({
    index,
    key,
    style,
  }: RowRendererParamsType): JSX.Element | undefined => {
    const wallets = this.getWallets();
    const item = wallets[index];

    return (
      <ConversationListItem
        key={key}
        id={''}
        phoneNumber={item['walletName']}
        name={item['walletName']}
        color={''}
        type={'direct'}
        isMe={false}
        lastUpdated={0}
        unreadCount={0}
        mentionedUs={false}
        isTyping={false}
        isSelected={false}
        i18n={window.i18n}
        onClick={console.log}
      />
    );
  };

  private renderClosableOverlay() {
    return (
      <SessionClosableOverlay
        overlayMode={SessionClosableOverlayType.Contact}
        onChangeSessionID={this.handleRecipientSessionIDChanged}
        onCloseClick={this.handleToggleOverlay}
        onButtonClick={this.handleOnAddContact}
      />
    );
  }

  private handleToggleOverlay() {
    this.setState((prevState: { showAddContactView: boolean }) => ({
      showAddContactView: !prevState.showAddContactView,
    }));
  }

  private handleOnAddContact() {
    const sessionID = this.state.addContactRecipientID.trim();
    const error = validateNumber(sessionID, window.i18n);

    if (error) {
      ToastUtils.push({
        title: error,
        type: 'error',
        id: 'addContact',
      });
    } else {
      window.Whisper.events.trigger('showConversation', sessionID);
    }
  }

  private handleRecipientSessionIDChanged(value: string) {
    this.setState({ addContactRecipientID: value });
  }

  private renderWallets() {
    return (
      <div className="left-pane-contact-content">
        {this.renderList()}
        {this.renderBottomButtons()}
      </div>
    );
  }

  private renderBottomButtons(): JSX.Element {
    const addContact = 'Add Wallet';//window.i18n('addContact');

    return (
      <div className="left-pane-contact-bottom-buttons">
        <SessionButton
          text={addContact}
          buttonType={SessionButtonType.SquareOutline}
          buttonColor={SessionButtonColor.Green}
          onClick={this.handleToggleOverlay}
        />
      </div>
    );
  }

  private getWallets() {
    return [
      { walletName: 'Secret Wallet' },
      { walletName: 'Drug Money' },
      { walletName: 'Money for sold Children' },
      { walletName: 'Already washed' }
    ]
  }

  private renderList() {
    const wallets = this.getWallets();
    const length = Number(wallets.length);

    const list = (
      <div className="module-left-pane__list" key={0}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              className="module-left-pane__virtual-list"
              height={height}
              rowCount={length}
              rowHeight={64}
              rowRenderer={this.renderRow}
              width={width}
              autoHeight={false}
            />
          )}
        </AutoSizer>
      </div>
    );

    return [list];
  }
}
