import React from 'react';

import { RenderTextCallbackType } from '../../types/Util';
import classNames from 'classnames';
import { MultiDeviceProtocol } from '../../session/protocols';
import { FindMember } from '../../util';

declare global {
  interface Window {
    shortenPubkey: any;
    pubkeyPattern: any;
    getConversations: any;
  }
}

interface MentionProps {
  key: number;
  text: string;
  convoId: string;
}

interface MentionState {
  found: any;
  us: boolean;
}

class Mention extends React.Component<MentionProps, MentionState> {
  private intervalHandle: any = null;
  constructor(props: any) {
    super(props);

    this.tryRenameMention = this.tryRenameMention.bind(this);
  }

  public componentWillMount() {
    this.setState({ found: false });

    // TODO: give up after some period of time?
    this.intervalHandle = setInterval(this.tryRenameMention, 30000);

    this.tryRenameMention().ignore();
  }

  public componentWillUnmount() {
    this.clearOurInterval();
  }

  public render() {
    if (this.state.found) {
      // TODO: We don't have to search the database of message just to know that the message is for us!
      const us = this.state.us;
      const className = classNames(
        'mention-profile-name',
        us && 'mention-profile-name-us'
      );

      const profileName = this.state.found.authorProfileName;
      const displayedName =
        profileName && profileName.length > 0 ? profileName : 'Anonymous';

      return <span className={className}>{displayedName}</span>;
    } else {
      return (
        <span className="mention-profile-name">
          {window.shortenPubkey(this.props.text)}
        </span>
      );
    }
  }

  private clearOurInterval() {
    clearInterval(this.intervalHandle);
  }

  private async tryRenameMention() {
    const bound = this.clearOurInterval.bind(this);
    const found = await FindMember.findMember(
      this.props.text.slice(1),
      this.props.convoId,
      bound
    );
    if (found) {
      const us = await MultiDeviceProtocol.isOurDevice(found.authorPhoneNumber);

      this.setState({ found, us });
      this.clearOurInterval();
    }
  }
}

interface Props {
  text: string;
  renderOther?: RenderTextCallbackType;
  convoId: string;
}

export class AddMentions extends React.Component<Props> {
  public static defaultProps: Partial<Props> = {
    renderOther: ({ text }) => text,
  };

  public render() {
    const { text, renderOther, convoId } = this.props;
    const results: Array<any> = [];
    const FIND_MENTIONS = window.pubkeyPattern;

    // We have to do this, because renderNonNewLine is not required in our Props object,
    //  but it is always provided via defaultProps.
    if (!renderOther) {
      return;
    }

    let match = FIND_MENTIONS.exec(text);
    let last = 0;
    let count = 1000;

    if (!match) {
      return renderOther({ text, key: 0 });
    }

    while (match) {
      if (last < match.index) {
        const otherText = text.slice(last, match.index);
        results.push(renderOther({ text: otherText, key: count++ }));
      }

      const pubkey = text.slice(match.index, FIND_MENTIONS.lastIndex);
      results.push(<Mention text={pubkey} key={count++} convoId={convoId} />);

      // @ts-ignore
      last = FIND_MENTIONS.lastIndex;
      match = FIND_MENTIONS.exec(text);
    }

    if (last < text.length) {
      results.push(renderOther({ text: text.slice(last), key: count++ }));
    }

    return results;
  }
}
