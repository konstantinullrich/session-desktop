/* global Whisper, log */

// eslint-disable-next-line func-names
(function() {
  'use strict';

  window.Whisper = window.Whisper || {};

  Whisper.AddModeratorsDialogView = Whisper.View.extend({
    className: 'loki-dialog modal',
    async initialize(convo) {
      this.close = this.close.bind(this);
      this.onSubmit = this.onSubmit.bind(this);

      this.chatName = convo.get('name');
      this.chatServer = convo.get('server');
      this.channelId = convo.get('channelId');

      // get current list of moderators
      this.channelAPI = await convo.getPublicSendData();
      const modPubKeys = await this.channelAPI.getModerators();
      const convos = window.getConversations().models;

      // private contacts (not you) that aren't already moderators
      const contacts = convos.filter(
        d =>
          !!d &&
          d.isPrivate() &&
          !d.isBlocked() &&
          !d.isMe() &&
          !modPubKeys.includes(d.id)
      );

      this.contacts = contacts;

      this.$el.focus();
      this.render();
    },
    render() {
      const view = new Whisper.ReactWrapperView({
        className: 'add-moderators-dialog',
        Component: window.Signal.Components.AddModeratorsDialog,
        props: {
          contactList: this.contacts,
          chatName: this.chatName,
          onSubmit: this.onSubmit,
          onClose: this.close,
        },
      });

      this.$el.append(view.el);
      return this;
    },
    close() {
      this.remove();
    },
    async onSubmit(pubKeys) {
      log.info(`asked to add ${pubKeys}`);
      const res = await this.channelAPI.serverAPI.addModerators(pubKeys);
      if (res !== true) {
        // we have errors, deal with them...
        // how?
      }
    },
  });
})();
