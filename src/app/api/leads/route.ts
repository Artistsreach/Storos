import { NextRequest, NextResponse } from "next/server";
import {
  hunterDiscover,
  hunterDomainSearch,
  hunterEmailFinder,
  hunterEmailEnrichment,
} from "@/lib/hunter";

function isEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

function isDomain(input: string) {
  const s = input.trim().toLowerCase();
  if (s.includes(" ")) return false;
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(s);
}

function parseNameAndDomain(input: string): { first?: string; last?: string; domain?: string } | null {
  // Try to extract patterns like:
  // "First Last @domain.com" or "First Last, domain.com" or "First Last domain.com"
  const m = input.trim().match(/^([A-Za-z\-']+)\s+([A-Za-z\-']+)[\s,@]+([a-z0-9.-]+\.[a-z]{2,})$/i);
  if (m) {
    return { first: m[1], last: m[2], domain: m[3].toLowerCase() };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: any = {};
    if (contentType.includes("application/json")) {
      body = await req.json();
    }

    const query: string = (body.query || "").toString();

    // Allow structured overrides too
    const domain = body.domain?.toString();
    const email = body.email?.toString();
    const first_name = body.first_name?.toString();
    const last_name = body.last_name?.toString();
    const full_name = body.full_name?.toString();

    const tasks: Promise<any>[] = [];

    // Decide what to call based on inputs
    if (email || isEmail(query)) {
      const emailValue = email || query.trim();
      // Email enrichment and combined company info via domain
      tasks.push(hunterEmailEnrichment({ email: emailValue }));
      const domainFromEmail = emailValue.split("@")[1];
      if (domainFromEmail && isDomain(domainFromEmail)) {
        tasks.push(hunterDomainSearch({ domain: domainFromEmail, limit: 10 }));
      }
    } else if ((first_name && (last_name || full_name)) || parseNameAndDomain(query) || (domain && (first_name || last_name || full_name))) {
      // Email Finder
      let efDomain = domain;
      let efFirst = first_name;
      let efLast = last_name;
      let efFull = full_name;

      if (!efDomain || (!efFirst && !efFull)) {
        const parsed = parseNameAndDomain(query);
        if (parsed) {
          efDomain = efDomain || parsed.domain;
          efFirst = efFirst || parsed.first;
          efLast = efLast || parsed.last;
        }
      }

      if (!efDomain) {
        return NextResponse.json({ errors: [{ id: "wrong_params", details: "Missing domain for Email Finder" }] }, { status: 400 });
      }

      tasks.push(
        hunterEmailFinder({
          domain: efDomain,
          first_name: efFirst,
          last_name: efLast,
          full_name: efFull,
        })
      );
      // Add domain search as complement
      tasks.push(hunterDomainSearch({ domain: efDomain, limit: 10 }));
    } else if (domain || isDomain(query)) {
      const d = (domain || query.trim()).toLowerCase();
      // Domain Search + Company enrichment-like context via domain-search
      tasks.push(hunterDomainSearch({ domain: d, limit: 10 }));
      // Also try Discover limited to the org domain to get company meta
      tasks.push(
        hunterDiscover({
          organization: { domain: [d] },
          limit: 100,
          offset: 0,
        })
      );
    } else {
      // Natural language Discover
      const q = query.length ? query : "";
      if (!q) {
        return NextResponse.json({ errors: [{ id: "wrong_params", details: "Provide a query, email, domain, or name+domain" }] }, { status: 400 });
      }
      tasks.push(hunterDiscover({ query: q }));
    }

    const results = await Promise.allSettled(tasks);
    const data = results.map((r) => (r.status === "fulfilled" ? r.value : { error: true, reason: (r as any).reason?.message || String((r as any).reason) }));

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ errors: [{ id: "server_error", details: err?.message || "Unknown error" }] }, { status: 500 });
  }
}
