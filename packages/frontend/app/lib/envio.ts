import { createClient } from 'graphql-ws'
import { GraphQLClient } from 'graphql-request'

const ENVIO_URL = process.env.NEXT_PUBLIC_ENVIO_GRAPHQL_URL as string

export const graphqlClient = new GraphQLClient(ENVIO_URL)

export const wsClient = createClient({
  url: ENVIO_URL.replace('http', 'ws'),
})

export const ACTIVITY_FEED_QUERY = `
  query GetActivityFeed($userAddress: String!) {
    paymentSentEvents(
      where: { or: [{ from: $userAddress }, { to: $userAddress }] }
      orderBy: timestamp
      orderDirection: desc
      limit: 50
    ) {
      id
      from
      to
      amount
      token
      timestamp
      txHash
    }
    paymentRequestedEvents(
      where: { or: [{ from: $userAddress }, { to: $userAddress }] }
      orderBy: timestamp
      orderDirection: desc
      limit: 50
    ) {
      id
      from
      to
      amount
      token
      requestId
      timestamp
    }
    withdrawalRequestedEvents(
      where: { user: $userAddress }
      orderBy: timestamp
      orderDirection: desc
      limit: 50
    ) {
      id
      user
      amount
      currency
      requestId
      timestamp
    }
  }
`

export const ACTIVITY_SUBSCRIPTION = `
  subscription ActivitySubscription($userAddress: String!) {
    paymentSentEvents(
      where: { or: [{ from: $userAddress }, { to: $userAddress }] }
    ) {
      id
      from
      to
      amount
      token
      timestamp
      txHash
    }
    paymentRequestedEvents(
      where: { or: [{ from: $userAddress }, { to: $userAddress }] }
    ) {
      id
      from
      to
      amount
      token
      requestId
      timestamp
    }
    withdrawalRequestedEvents(
      where: { user: $userAddress }
    ) {
      id
      user
      amount
      currency
      requestId
      timestamp
    }
  }
`
