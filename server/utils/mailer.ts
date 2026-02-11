type MailPayload = {
  to: string
  subject: string
  text?: string
  html?: string
}

import { google } from 'googleapis'

const buildRawMessage = (payload: MailPayload, from: string) => {
  const isHtml = Boolean(payload.html)
  const body = isHtml ? payload.html : payload.text
  if (!body) {
    throw new Error('Email body is required')
  }

  const headers = [
    `From: ${from}`,
    `To: ${payload.to}`,
    `Subject: ${payload.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: ${isHtml ? 'text/html' : 'text/plain'}; charset="UTF-8"`,
  ]

  const message = `${headers.join('\r\n')}\r\n\r\n${body}`
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const getGmailClient = () => {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN
  const redirectUri = process.env.GMAIL_REDIRECT_URI

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Gmail API configuration is missing')
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  auth.setCredentials({ refresh_token: refreshToken })

  return google.gmail({ version: 'v1', auth })
}

export const sendMail = async (payload: MailPayload) => {
  const gmail = getGmailClient()
  const from = process.env.GMAIL_FROM || process.env.GMAIL_USER

  if (!from) {
    throw new Error('GMAIL_FROM or GMAIL_USER is required')
  }

  const raw = buildRawMessage(payload, from)

  return gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
}
