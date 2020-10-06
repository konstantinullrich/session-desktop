import React from 'react';

import { ActionsPanel, SectionType } from './session/ActionsPanel';
import { LeftPaneMessageSection } from './session/LeftPaneMessageSection';

import { PropsData as ConversationListItemPropsType } from './ConversationListItem';
import { PropsData as SearchResultsProps } from './SearchResults';
import { SearchOptions } from '../types/Search';
import { LeftPaneSectionHeader } from './session/LeftPaneSectionHeader';

import { ConversationType } from '../state/ducks/conversations';
import { LeftPaneContactSection } from './session/LeftPaneContactSection';
import { LeftPaneSettingSection } from './session/LeftPaneSettingSection';
import { SessionIconType } from './session/icon';
import { LeftPaneWalletSection } from './session/LeftPaneWalletSection';

// from https://github.com/bvaughn/react-virtualized/blob/fb3484ed5dcc41bffae8eab029126c0fb8f7abc0/source/List/types.js#L5
export type RowRendererParamsType = {
  index: number;
  isScrolling: boolean;
  isVisible: boolean;
  key: string;
  parent: Object;
  style: Object;
};

interface State {
  selectedSection: SectionType;
}

interface Props {
  conversations: Array<ConversationListItemPropsType>;
  contacts: Array<ConversationType>;

  unreadMessageCount: number;
  searchResults?: SearchResultsProps;
  searchTerm: string;
  isSecondaryDevice: boolean;

  openConversationInternal: (id: string, messageId?: string) => void;
  updateSearchTerm: (searchTerm: string) => void;
  search: (query: string, options: SearchOptions) => void;
  clearSearch: () => void;
}

export class LeftPane extends React.Component<Props, State> {
  public state = {
    selectedSection: SectionType.Message,
  };

  public constructor(props: any) {
    super(props);
    this.handleSectionSelected = this.handleSectionSelected.bind(this);
  }

  // this static function is set here to be used by all subsections (message, contacts,...) to render their headers
  public static RENDER_HEADER(
    labels: Array<string>,
    onTabSelected?: any,
    buttonLabel?: string,
    buttonIcon?: SessionIconType,
    buttonClicked?: any,
    notificationCount?: number
  ): JSX.Element {
    return (
      <LeftPaneSectionHeader
        onTabSelected={onTabSelected}
        selectedTab={0}
        labels={labels}
        buttonLabel={buttonLabel}
        buttonIcon={buttonIcon}
        buttonClicked={buttonClicked}
        notificationCount={notificationCount}
      />
    );
  }

  public handleSectionSelected(section: SectionType) {
    this.props.clearSearch();
    this.setState({ selectedSection: section });
  }

  public render(): JSX.Element {
    return (
      <div className="module-left-pane-session">
        <ActionsPanel
          selectedSection={this.state.selectedSection}
          onSectionSelected={this.handleSectionSelected}
          conversations={this.props.conversations}
          unreadMessageCount={this.props.unreadMessageCount}
        />
        <div className="module-left-pane">{this.renderSection()}</div>
      </div>
    );
  }

  private renderSection(): JSX.Element | undefined {
    switch (this.state.selectedSection) {
      case SectionType.Message:
        return this.renderMessageSection();
      case SectionType.Contact:
        return this.renderContactSection();
      case SectionType.Settings:
        return this.renderSettingSection();
      case SectionType.Wallet:
        return this.renderWalletSection()
      case SectionType.Moon:
        return window.toggleTheme();
      default:
        return undefined;
    }
  }

  private renderMessageSection() {
    const {
      openConversationInternal,
      conversations,
      searchResults,
      searchTerm,
      isSecondaryDevice,
      updateSearchTerm,
      search,
      clearSearch,
    } = this.props;

    return (
      <LeftPaneMessageSection
        contacts={this.props.contacts}
        openConversationInternal={openConversationInternal}
        conversations={conversations}
        searchResults={searchResults}
        searchTerm={searchTerm}
        isSecondaryDevice={isSecondaryDevice}
        updateSearchTerm={updateSearchTerm}
        search={search}
        clearSearch={clearSearch}
      />
    );
  }

  private renderContactSection() {
    const {
      openConversationInternal,
      conversations,
      searchResults,
      searchTerm,
      isSecondaryDevice,
      updateSearchTerm,
      search,
      clearSearch,
      contacts,
    } = this.props;

    return (
      <LeftPaneContactSection
        openConversationInternal={openConversationInternal}
        conversations={conversations}
        contacts={contacts}
        searchResults={searchResults}
        searchTerm={searchTerm}
        isSecondaryDevice={isSecondaryDevice}
        updateSearchTerm={updateSearchTerm}
        search={search}
        clearSearch={clearSearch}
      />
    );
  }

  private renderSettingSection() {
    const { isSecondaryDevice } = this.props;

    return <LeftPaneSettingSection isSecondaryDevice={isSecondaryDevice} />;
  }

  private renderWalletSection() {
    const {
      openConversationInternal,
      conversations,
      searchResults,
      searchTerm,
      isSecondaryDevice,
      updateSearchTerm,
      search,
      clearSearch,
      contacts,
    } = this.props;

    return (
      <LeftPaneWalletSection
        openConversationInternal={openConversationInternal}
        isSecondaryDevice={isSecondaryDevice}
      />
    );
  }
}
