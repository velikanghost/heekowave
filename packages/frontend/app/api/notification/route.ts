import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configure VAPID keys
webpush.setVapidDetails(
  'mailto:admin@heekowave.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscription, payload } = body

    const notificationPayload = JSON.stringify({
      title: payload.title || 'Heekowave',
      body: payload.body || 'You have a new notification',
      icon: '/icons/icon-512x512.png',
      badge: '/icons/icon-192x192.png',
      data: payload.data || {},
    })

    await webpush.sendNotification(subscription, notificationPayload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 })
  }
}
