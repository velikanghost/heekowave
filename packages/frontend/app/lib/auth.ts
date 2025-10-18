import { verifyMessage, recoverMessageAddress } from 'viem'

export interface SignatureVerification {
  isValid: boolean
  address?: string
  error?: string
}

export const verifyUserSignature = async (
  message: string,
  signature: `0x${string}`,
  expectedAddress?: string,
): Promise<SignatureVerification> => {
  try {
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature,
    })

    if (
      expectedAddress &&
      recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()
    ) {
      return {
        isValid: false,
        error: 'Address mismatch',
      }
    }

    return {
      isValid: true,
      address: recoveredAddress,
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid signature',
    }
  }
}

export const createMessageHash = (data: Record<string, any>): string => {
  const sortedKeys = Object.keys(data).sort()
  const messageParts = sortedKeys.map((key) => `${key}:${data[key]}`)
  return messageParts.join('|')
}
