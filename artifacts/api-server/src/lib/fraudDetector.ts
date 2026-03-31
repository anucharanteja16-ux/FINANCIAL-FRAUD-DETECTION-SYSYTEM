interface FraudIndicator {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
}

interface UrlCheck {
  url: string;
  isSuspicious: boolean;
  reason: string;
}

interface AnalysisOutput {
  classification: "safe" | "spam" | "fraud";
  confidence: number;
  riskScore: number;
  indicators: FraudIndicator[];
  detectedUrls: UrlCheck[];
  explanation: string;
}

const FRAUD_KEYWORDS = [
  "verify your account", "click here immediately", "your account has been suspended",
  "unauthorized access", "confirm your identity", "account locked", "security alert",
  "limited time offer", "win a prize", "claim your reward", "you have been selected",
  "dear customer", "otp", "one time password", "pin number", "cvv",
  "credit card details", "bank account details", "send money", "wire transfer",
  "western union", "gift card", "bitcoin", "cryptocurrency payment",
  "refund initiated", "irs", "income tax", "police", "arrest warrant",
  "congratulations", "lottery", "million dollars", "inheritance",
  "nigerian prince", "unclaimed funds",
];

const SPAM_KEYWORDS = [
  "free offer", "discount", "sale", "buy now", "act now", "limited offer",
  "subscribe", "unsubscribe", "opt out", "click here", "visit our website",
  "call now", "order now", "get rich", "earn money", "work from home",
  "no credit check", "debt relief", "lose weight", "miracle cure",
  "you have been chosen", "special deal", "exclusive offer",
];

const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly/i, /tinyurl/i, /goo\.gl/i, /t\.co/i, /ow\.ly/i,
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
  /[a-z0-9]{20,}\.(com|net|org|info|biz)/i,
  /paypa1|paypai|paypal-|pay-pal/i,
  /amaz0n|amazon-|amаzon/i,
  /netfl1x|netflix-|nеtflix/i,
  /g00gle|google-secure|googl3/i,
  /bank-|banking-|secure-bank/i,
  /verify-|update-account|confirm-/i,
  /login-|signin-|account-/i,
  /\.tk$|\.ml$|\.ga$|\.cf$|\.gq$/i,
];

const LEGITIMATE_DOMAINS = [
  "google.com", "apple.com", "microsoft.com", "amazon.com", "paypal.com",
  "chase.com", "bankofamerica.com", "wellsfargo.com", "citibank.com",
];

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+/gi;
  return text.match(urlRegex) || [];
}

function checkUrl(url: string): UrlCheck {
  const lowerUrl = url.toLowerCase();

  for (const domain of LEGITIMATE_DOMAINS) {
    if (lowerUrl.includes(domain) && !lowerUrl.includes(`${domain}-`) && !lowerUrl.includes(`-${domain}`)) {
      const hostMatch = lowerUrl.match(/^https?:\/\/([^/]+)/);
      if (hostMatch) {
        const host = hostMatch[1].replace("www.", "");
        if (host === domain || host.endsWith(`.${domain}`)) {
          return { url, isSuspicious: false, reason: "Verified legitimate domain" };
        }
      }
    }
  }

  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(url)) {
      if (/bit\.ly|tinyurl|goo\.gl|t\.co|ow\.ly/i.test(url)) {
        return { url, isSuspicious: true, reason: "URL shortener used to hide true destination" };
      }
      if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
        return { url, isSuspicious: true, reason: "Direct IP address used instead of domain name" };
      }
      if (/paypa1|paypai|paypal-/i.test(url)) {
        return { url, isSuspicious: true, reason: "Typosquatting PayPal domain detected" };
      }
      if (/amaz0n|amazon-/i.test(url)) {
        return { url, isSuspicious: true, reason: "Typosquatting Amazon domain detected" };
      }
      if (/\.tk$|\.ml$|\.ga$|\.cf$|\.gq$/i.test(url)) {
        return { url, isSuspicious: true, reason: "Free TLD commonly used in phishing attacks" };
      }
      if (/verify-|update-account|confirm-|login-|signin-/i.test(url)) {
        return { url, isSuspicious: true, reason: "URL contains phishing keywords" };
      }
      return { url, isSuspicious: true, reason: "URL matches known suspicious pattern" };
    }
  }

  return { url, isSuspicious: false, reason: "No suspicious patterns detected" };
}

function detectIndicators(message: string, channel: string): FraudIndicator[] {
  const indicators: FraudIndicator[] = [];
  const lower = message.toLowerCase();

  const fraudMatches = FRAUD_KEYWORDS.filter(kw => lower.includes(kw));
  for (const kw of fraudMatches.slice(0, 3)) {
    indicators.push({
      type: "suspicious_keyword",
      description: `Message contains fraud-associated phrase: "${kw}"`,
      severity: "high",
    });
  }

  if (/urgent|immediately|act now|right away|do not delay|expires? (today|soon|in \d+ hours?)/i.test(message)) {
    indicators.push({
      type: "urgency_tactic",
      description: "Message uses urgency/pressure tactics to force immediate action",
      severity: "high",
    });
  }

  if (/\b(otp|one.time.password|pin|cvv|card number|account number|sort code|routing number)\b/i.test(message)) {
    indicators.push({
      type: "credential_request",
      description: "Message requests sensitive financial credentials or authentication codes",
      severity: "high",
    });
  }

  if (/send|transfer|pay|deposit|wire|remit/i.test(message) && /money|funds|cash|amount|\$|£|€|usd|gbp|eur/i.test(message)) {
    indicators.push({
      type: "money_transfer_request",
      description: "Message requests a money transfer or payment",
      severity: "high",
    });
  }

  if (/won|winner|prize|lottery|award|reward|selected|chosen/i.test(message)) {
    indicators.push({
      type: "prize_scam",
      description: "Message claims you have won a prize or been selected for a reward",
      severity: "medium",
    });
  }

  if (/dear (customer|user|client|member|valued)/i.test(message)) {
    indicators.push({
      type: "generic_greeting",
      description: "Generic impersonal greeting often used in mass phishing campaigns",
      severity: "low",
    });
  }

  if (/[A-Z]{5,}/.test(message)) {
    indicators.push({
      type: "excessive_caps",
      description: "Excessive use of capital letters — common in spam and fraud messages",
      severity: "low",
    });
  }

  if (/\+?[0-9\s\-().]{10,}/.test(message) && channel === "email") {
    indicators.push({
      type: "suspicious_phone",
      description: "Phone number embedded in email — potential callback fraud attempt",
      severity: "low",
    });
  }

  return indicators;
}

function classify(indicators: FraudIndicator[], detectedUrls: UrlCheck[], message: string): {
  classification: "safe" | "spam" | "fraud";
  confidence: number;
  riskScore: number;
} {
  let riskScore = 0;

  for (const ind of indicators) {
    if (ind.severity === "high") riskScore += 25;
    else if (ind.severity === "medium") riskScore += 15;
    else riskScore += 5;
  }

  const suspiciousUrls = detectedUrls.filter(u => u.isSuspicious);
  riskScore += suspiciousUrls.length * 20;

  const lower = message.toLowerCase();
  const spamMatches = SPAM_KEYWORDS.filter(kw => lower.includes(kw));
  const spamScore = spamMatches.length * 8;

  riskScore = Math.min(riskScore, 100);
  const totalScore = Math.min(riskScore + spamScore * 0.3, 100);

  let classification: "safe" | "spam" | "fraud";
  let confidence: number;

  if (riskScore >= 50 || (indicators.some(i => i.severity === "high") && riskScore >= 30)) {
    classification = "fraud";
    confidence = Math.min(60 + riskScore * 0.4, 99);
  } else if (totalScore >= 20 || spamMatches.length >= 2) {
    classification = "spam";
    confidence = Math.min(50 + totalScore, 92);
  } else {
    classification = "safe";
    confidence = Math.max(100 - totalScore * 2, 55);
  }

  return {
    classification,
    confidence: Math.round(confidence),
    riskScore: Math.round(riskScore),
  };
}

function generateExplanation(
  message: string,
  classification: string,
  indicators: FraudIndicator[],
  detectedUrls: UrlCheck[],
): string {
  const suspiciousUrls = detectedUrls.filter(u => u.isSuspicious);
  const highIndicators = indicators.filter(i => i.severity === "high");

  if (classification === "fraud") {
    const parts = ["This message shows strong indicators of financial fraud."];
    if (highIndicators.length > 0) {
      parts.push(`Key red flags include: ${highIndicators.map(i => i.type.replace(/_/g, " ")).join(", ")}.`);
    }
    if (suspiciousUrls.length > 0) {
      parts.push(`${suspiciousUrls.length} suspicious URL(s) were detected that may lead to phishing sites.`);
    }
    parts.push("Do not click any links, provide personal information, or transfer money. Report this message to your bank and relevant authorities.");
    return parts.join(" ");
  }

  if (classification === "spam") {
    const parts = ["This message appears to be unsolicited marketing or spam."];
    if (indicators.length > 0) {
      parts.push("It contains promotional language and pressure tactics typical of spam campaigns.");
    }
    parts.push("While not necessarily malicious, exercise caution before clicking links or providing personal details.");
    return parts.join(" ");
  }

  return "This message does not contain significant fraud or spam indicators and appears to be legitimate. Always remain vigilant and verify unexpected communications through official channels.";
}

export function analyzeMessage(message: string, channel: string): AnalysisOutput {
  const detectedUrls = extractUrls(message).map(url => checkUrl(url));
  const indicators = detectIndicators(message, channel);
  const { classification, confidence, riskScore } = classify(indicators, detectedUrls, message);
  const explanation = generateExplanation(message, classification, indicators, detectedUrls);

  return {
    classification,
    confidence,
    riskScore,
    indicators,
    detectedUrls,
    explanation,
  };
}
