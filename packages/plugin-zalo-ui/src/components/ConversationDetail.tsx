import React from 'react';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import MailConversation from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/mail/MailConversation';
import SimpleMessage from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/SimpleMessage';
import { queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';

class Detail extends React.Component<any> {
  render() {
    const { currentConversation, messagesQuery, zaloConversationMessages } = this.props;

    if (zaloConversationMessages.loading) {
      return <Spinner />;
    }

    const messages = zaloConversationMessages.zaloConversationMessages || [];
    let rows: React.ReactNode[] = [];
    console.log('messages', messages)
    messages.forEach(message => {
      console.log('message', message)
      rows.push(
        <SimpleMessage
          message={message}
          key={message._id}
          isStaff={message.userId ? true : false}
        />
      )
    })

    return rows;
    return (
      <SimpleMessage
        message={messages}
        // conversationMessages={messages}
      />
    );
  }
}

const WithQuery = compose(
  graphql<any>(gql(queries.detail), {
    name: 'messagesQuery',
    options: ({ currentId }) => {
      return {
        variables: {
          conversationId: currentId
        },
        fetchPolicy: 'network-only'
      };
    }
  }),
  graphql<any>(gql(queries.zaloConversationMessages), {
    name: 'zaloConversationMessages',
    options: ({ currentId }) => {
      return {
        variables: {
          conversationId: currentId,
          limit: 0,
          skip: 0 
        },
        fetchPolicy: 'network-only'
      };
    }
  }),

)(Detail);

export default WithQuery;
