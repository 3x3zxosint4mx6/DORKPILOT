
import { ResourceItem } from './types';

export const CANADIAN_RESOURCES: ResourceItem[] = [
  {
    name: "Open Government Canada",
    url: "https://open.canada.ca/en",
    category: "Federal",
    description: "Search data, information, and publications from the Government of Canada."
  },
  {
    name: "SEDAR+",
    url: "https://www.sedarplus.ca/",
    category: "Financial",
    description: "System for Electronic Document Analysis and Retrieval for Canadian public companies."
  },
  {
    name: "Canada's Lobbyist Registry",
    url: "https://lobbycanada.gc.ca/",
    category: "Political",
    description: "Check who is lobbying federal public office holders."
  },
  {
    name: "CANI: Canadian Name Index",
    url: "https://genealogy.bac-lac.gc.ca/",
    category: "Historical",
    description: "Library and Archives Canada's database of people and names."
  },
  {
    name: "Ontario Land Registry",
    url: "https://www.onland.ca/",
    category: "Provincial",
    description: "OnLand web portal for Ontario land registry services."
  },
  {
    name: "BC Corporate Registry",
    url: "https://www.bcregistry.gov.bc.ca/",
    category: "Provincial",
    description: "British Columbia's registry for businesses and corporations."
  },
  {
    name: "Canada Gazette",
    url: "https://gazette.gc.ca/",
    category: "Federal",
    description: "The official newspaper of the Government of Canada since 1841."
  }
];

export const DARK_WEB_ENGINES = [
  { label: 'Ahmia.fi (Primary Index)', value: 'ahmia.fi' },
  { label: 'Torch (via Onion.ly)', value: 'xmh57jrbegenodv6yq7p6l7i4p5n4p2k2mup54x7f3skpqiayk4qf4qd.onion.ly' },
  { label: 'DuckDuckGo (via Onion.ws)', value: 'duckduckgogg42xjoc72x3sjasowoarfbgcmucfidxu624fpgbsrt7qd.onion.ws' },
  { label: 'Haystack (via Onion.pet)', value: 'haystak5n4s7uqc7.onion.pet' },
  { label: 'Not Evil (via Onion.dog)', value: 'hss3uro2hsxfogfq.onion.dog' },
  { label: 'Onion.ly Gateway', value: 'onion.ly' }
];

export const CANADIAN_GOVT_SITES = [
  { label: 'Federal (General)', value: 'gc.ca' },
  { label: 'Government of Canada', value: 'canada.ca' },
  { label: 'Ontario', value: 'ontario.ca' },
  { label: 'British Columbia', value: 'gov.bc.ca' },
  { label: 'Quebec', value: 'gouv.qc.ca' },
  { label: 'Alberta', value: 'alberta.ca' },
  { label: 'Manitoba', value: 'gov.mb.ca' },
  { label: 'Saskatchewan', value: 'saskatchewan.ca' },
  { label: 'Nova Scotia', value: 'novascotia.ca' },
  { label: 'New Brunswick', value: 'gnb.ca' },
  { label: 'PEI', value: 'princeedwardisland.ca' },
  { label: 'Newfoundland', value: 'gov.nl.ca' },
  { label: 'Toronto (Municipal)', value: 'toronto.ca' },
  { label: 'Vancouver (Municipal)', value: 'vancouver.ca' },
  { label: 'Montreal (Municipal)', value: 'montreal.ca' },
  { label: 'Ottawa (Municipal)', value: 'ottawa.ca' },
  { label: 'Calgary (Municipal)', value: 'calgary.ca' },
  { label: 'CBC News', value: 'cbc.ca' }
];

export const SOURCE_TYPE_PRESETS = [
  { label: 'Social Media', value: '(site:twitter.com OR site:facebook.com OR site:linkedin.com OR site:instagram.com OR site:tiktok.com)' },
  { label: 'News Archives', value: '(site:cbc.ca OR site:theglobeandmail.com OR site:thestar.com OR site:nationalpost.com OR site:ctvnews.ca)' },
  { label: 'Forums & Communities', value: '(site:reddit.com OR site:quora.com OR site:stackexchange.com)' },
  { label: 'Academic/Research', value: '(site:edu OR site:ac.uk OR site:scholar.google.com)' },
  { label: 'Legal/Gazettes', value: '(site:gazette.gc.ca OR site:canlii.org)' }
];

export const GEOGRAPHIC_KEYWORDS = [
  { label: 'GTA (Greater Toronto Area)', value: '"Greater Toronto Area" OR "GTA" OR "Toronto"' },
  { label: 'GVA (Greater Vancouver Area)', value: '"Greater Vancouver Area" OR "GVA" OR "Vancouver"' },
  { label: 'National Capital Region', value: '"National Capital Region" OR "NCR" OR "Ottawa" OR "Gatineau"' },
  { label: 'Atlantic Canada', value: '"Atlantic Canada" OR "Maritimes" OR "Nova Scotia" OR "NB" OR "PEI" OR "NL"' },
  { label: 'Western Canada', value: '"Western Canada" OR "Prairies" OR "Alberta" OR "BC" OR "Saskatchewan" OR "Manitoba"' }
];

export const DARK_WEB_RESOURCES: ResourceItem[] = [
  {
    name: "Ahmia.fi",
    url: "https://ahmia.fi/",
    category: "Dark Web",
    description: "Search engine for hidden services on the Tor network. Indexes .onion domains."
  },
  {
    name: "Torch",
    url: "http://xmh57jrbegenodv6yq7p6l7i4p5n4p2k2mup54x7f3skpqiayk4qf4qd.onion/",
    category: "Tor Native",
    description: "One of the oldest search engines on the Tor network (requires Tor Browser)."
  },
  {
    name: "DuckDuckGo (Onion)",
    url: "https://duckduckgogg42xjoc72x3sjasowoarfbgcmucfidxu624fpgbsrt7qd.onion/",
    category: "Privacy",
    description: "The privacy-focused search engine's official .onion presence."
  }
];

export const OSINT_SEARCH_ENGINES: ResourceItem[] = [
  {
    name: "Shodan",
    url: "https://www.shodan.io/",
    category: "Infrastructure",
    description: "Search engine for Internet-connected devices. Find servers, webcams, and IoT devices."
  },
  {
    name: "Censys",
    url: "https://censys.io/",
    category: "Infrastructure",
    description: "Search engine for hosts and networks. Excellent for certificate and IP research."
  },
  {
    name: "Hunter.io",
    url: "https://hunter.io/",
    category: "Email",
    description: "Find email addresses associated with any domain name."
  },
  {
    name: "GreyNoise",
    url: "https://greynoise.io/",
    category: "Threat Intel",
    description: "Analyze internet background noise to filter out false positives in security logs."
  },
  {
    name: "ZoomEye",
    url: "https://www.zoomeye.org/",
    category: "Infrastructure",
    description: "Cyberspace search engine that maps the digital universe."
  },
  {
    name: "IntelX",
    url: "https://intelx.io/",
    category: "Data Leaks",
    description: "Search engine and data archive for emails, domains, IPs, and leaked data."
  },
  {
    name: "PublicWWW",
    url: "https://publicwww.com/",
    category: "Code/Web",
    description: "Search for snippets of code in the source code of websites."
  },
  {
    name: "BinaryEdge",
    url: "https://www.binaryedge.io/",
    category: "Infrastructure",
    description: "Scans the entire internet to provide real-time threat intelligence."
  }
];

export const COMMON_DORKS = [
  {
    label: "Federal PDF Documents",
    query: "site:gc.ca filetype:pdf"
  },
  {
    label: "Confidential/Sensitive Docs",
    query: "site:*.gov.ca intitle:\"confidential\" | intitle:\"internal use only\""
  },
  {
    label: "Exposed Directories",
    query: "site:*.ca intitle:\"index of\" \"parent directory\""
  },
  {
    label: "Logistics & Procurement",
    query: "site:gc.ca \"request for proposal\" | \"contract award\""
  }
];
