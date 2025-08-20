API Reference
Comprehensive reference for integrating with Plaid API endpoints
API endpoints and webhooks
For documentation on specific API endpoints and webhooks, use the navigation menu or search.
API access
To gain access to the Plaid API, create an account on the Plaid Dashboard. Once you’ve completed the signup process and acknowledged our terms, we’ll provide a live client_id and secret via the Dashboard.
API protocols and headers
The Plaid API is JSON over HTTP. Requests are POST requests, and responses are JSON, with errors indicated in response bodies as error_code and error_type (use these in preference to HTTP status codes for identifying application-level errors). All responses come as standard JSON, with a small subset returning binary data where appropriate. The Plaid API is served over HTTPS TLS v1.2 to ensure data privacy; HTTP and HTTPS with TLS versions other than 1.2 are not supported. Clients must use an up to date root certificate bundle as the only TLS verification path; certificate pinning should never be used. All requests must include a Content-Type of application/json and the body must be valid JSON.
Almost all Plaid API endpoints require a client_id and secret. These may be sent either in the request body or in the headers PLAID-CLIENT-ID and PLAID-SECRET.
Every Plaid API response includes a request_id, either in the body or (in the case of endpoints that return binary data, such as /asset_report/pdf/get) in the response headers. For faster support, include the request_id when contacting support regarding a specific API call.
API host
https://sandbox.plaid.com (Sandbox)
https://production.plaid.com (Production)

Introduction to webhooks
A webhook is an HTTP request used to provide push notifications. Plaid sends webhooks to programmatically inform you about changes to Plaid Items or the status of asynchronous processes. For example, Plaid will send a webhook when an Item is in an error state or has additional data available, or when a non-blocking process (like gathering transaction data or verifying a bank account via micro-deposits) is complete.
To receive Plaid webhooks, set up a dedicated endpoint on your server as a webhook listener that can receive POST requests, then provide this endpoint URL to Plaid as described in the next section. You can also test webhooks without setting up your own endpoint following the instructions in Testing webhooks in Sandbox.
Configuring webhooks
Webhooks are typically configured via the webhook parameter of /link/token/create, although some webhooks (especially those used in contexts where Link tokens are not always required), such as Identity Verification webhooks, are configured via the Plaid Dashboard instead. When specifying a webhook, the URL must be in the standard format of http(s)://(www.)domain.com/ and, if https, must have a valid SSL certificate.
To view response codes and debug any issues with webhook setup, see the Logs section in the Dashboard.
Plaid sends POST payloads with raw JSON to your webhook URL from one of the following IP addresses:
52.21.26.131
52.21.47.157
52.41.247.19
52.88.82.239
Note that these IP addresses are subject to change.
You can optionally verify webhooks to ensure they are from Plaid. For more information, see webhook verification.
Webhook retries
If there is a non-200 response or no response within 10 seconds from the webhook endpoint, Plaid will keep attempting to send the webhook for up to 24 hours. Each attempt will be tried after a delay that is 4 times longer than the previous delay, starting with 30 seconds.
To avoid unnecessary retries, Plaid won't retry webhooks if we detect that the webhook receiver endpoint has rejected more than 90% of webhooks sent by Plaid over the last 24 hours.
Best practices for applications using webhooks
You should design your application to handle duplicate and out-of-order webhooks. Ensure idempotency on actions you take when receiving a webhook. If you drive application state with webhooks, ensure your code doesn't rely on a specific order of webhook receipt.
If you (or Plaid) experience downtime for longer than Plaid's retry period, you will lose webhooks. Ensure your application can recover by implementing endpoint polling or other appropriate logic if a webhook is not received within an expected window. All data present in webhooks is also present in our other APIs.
It's best to keep your receiver as simple as possible, such as a receiver whose only job is to write the webhook into a queue or reliable storage. This is important for two reasons. First, if the receiver does not respond within 10 seconds, the delivery is considered failed. Second, because webhooks can arrive at unpredictable rates. Therefore if you do a lot of work in your receiver - e.g. generating and sending an email - spikes are likely to overwhelm your downstream services, or cause you to be rate-limited if the downstream is a third-party.
Testing webhooks in Sandbox
Webhooks will fire as normal in the Sandbox environment, with the exception of Transfer webhooks. For testing purposes, you can also use /sandbox/item/fire_webhook, /sandbox/income/fire_webhook, or /sandbox/transfer/fire_webhook to fire a webhook on demand. If you don't have a webhook endpoint configured yet, you can also use a tool such as Webhook.site or Request Bin to quickly and easily set up a webhook listener endpoint. When directing webhook traffic to third-party tools, make sure you are using Plaid's Sandbox environment and not sending out live data.

Auth
API reference for Auth endpoints and webhooks
Retrieve bank account information to set up electronic funds transfers, such as ACH payments in the US, EFT payments in Canada, BACS payments in the UK, and IBAN / SIC payments in the EU.
For how-to guidance, see the Auth documentation.
Endpoints
/auth/get
Fetch account information
/bank_transfer/event/list
Search for updates on micro-deposit verification statuses based on filter criteria
/bank_transfer/event/sync
Get updates on micro-deposit verification statuses using a cursor
See also
/processor/token/create
Create a token for using Auth with a processing partner
/sandbox/processor_token/create
Create a token for testing Auth with a processing partner
/processor/stripe/bank_account_token/create
Create a token for using Auth with Stripe as a processing partner
/sandbox/item/set_verification_status
Change a Sandbox Item's micro-deposit verification status
Webhooks
DEFAULT_UPDATE
Item has account(s) with updated Auth data
AUTOMATICALLY_VERIFIED
Item has been verified
VERIFICATION_EXPIRED
Item verification has failed
BANK_TRANSFERS_EVENTS_UPDATE
New micro-deposit verification events available
SMS_MICRODEPOSITS_VERIFICATION
Text message verification status has changed
Endpoints
/auth/get
Retrieve auth data
The /auth/get endpoint returns the bank account and bank identification numbers (such as routing numbers, for US accounts) associated with an Item's checking, savings, and cash management accounts, along with high-level account data and balances when available.
Versioning note: In API version 2017-03-08, the schema of the numbers object returned by this endpoint is substantially different. For details, see Plaid API versioning.
Request fields
Collapse all
client_id
string
Your Plaid API client_id. The client_id is required and may be provided either in the PLAID-CLIENT-ID header or as part of a request body.
secret
string
Your Plaid API secret. The secret is required and may be provided either in the PLAID-SECRET header or as part of a request body.
access_token
requiredstring
The access token associated with the Item data is being requested for.
options
object
An optional object to filter /auth/get results.
Hide object
account_ids
[string]
A list of account_ids to retrieve for the Item.
Note: An error will be returned if a provided account_id is not associated with the Item.
Select group for content switcher
Current librariesLegacy libraries
const request: AuthGetRequest = {
  access_token: accessToken,
};
try {
  const response = await plaidClient.authGet(request);
  const accountData = response.data.accounts;
  const numbers = response.data.numbers;
} catch (error) {
  // handle error
}
Response fields and example
Collapse all
accounts
[object]
The accounts for which numbers are being retrieved.
Hide object
account_id
string
Plaid’s unique identifier for the account. This value will not change unless Plaid can't reconcile the account with the data returned by the financial institution. This may occur, for example, when the name of the account changes. If this happens a new account_id will be assigned to the account.
The account_id can also change if the access_token is deleted and the same credentials that were used to generate that access_token are used to generate a new access_token on a later date. In that case, the new account_id will be different from the old account_id.
If an account with a specific account_id disappears instead of changing, the account is likely closed. Closed accounts are not returned by the Plaid API.
When using a CRA endpoint (an endpoint associated with Plaid Check Consumer Report, i.e. any endpoint beginning with /cra/), the account_id returned will not match the account_id returned by a non-CRA endpoint.
Like all Plaid identifiers, the account_id is case sensitive.
balances
object
A set of fields describing the balance for an account. Balance information may be cached unless the balance object was returned by /accounts/balance/get.
Hide object
available
nullablenumber
The amount of funds available to be withdrawn from the account, as determined by the financial institution.
For credit-type accounts, the available balance typically equals the limit less the current balance, less any pending outflows plus any pending inflows.
For depository-type accounts, the available balance typically equals the current balance less any pending outflows plus any pending inflows. For depository-type accounts, the available balance does not include the overdraft limit.
For investment-type accounts (or brokerage-type accounts for API versions 2018-05-22 and earlier), the available balance is the total cash available to withdraw as presented by the institution.
Note that not all institutions calculate the available  balance. In the event that available balance is unavailable, Plaid will return an available balance value of null.
Available balance may be cached and is not guaranteed to be up-to-date in realtime unless the value was returned by /accounts/balance/get.
If current is null this field is guaranteed not to be null.


Format: double 
current
nullablenumber
The total amount of funds in or owed by the account.
For credit-type accounts, a positive balance indicates the amount owed; a negative amount indicates the lender owing the account holder.
For loan-type accounts, the current balance is the principal remaining on the loan, except in the case of student loan accounts at Sallie Mae (ins_116944). For Sallie Mae student loans, the account's balance includes both principal and any outstanding interest. Similar to credit-type accounts, a positive balance is typically expected, while a negative amount indicates the lender owing the account holder.
For investment-type accounts (or brokerage-type accounts for API versions 2018-05-22 and earlier), the current balance is the total value of assets as presented by the institution.
Note that balance information may be cached unless the value was returned by /accounts/balance/get; if the Item is enabled for Transactions, the balance will be at least as recent as the most recent Transaction update. If you require realtime balance information, use the available balance as provided by /accounts/balance/get.
When returned by /accounts/balance/get, this field may be null. When this happens, available is guaranteed not to be null.


Format: double 
limit
nullablenumber
For credit-type accounts, this represents the credit limit.
For depository-type accounts, this represents the pre-arranged overdraft limit, which is common for current (checking) accounts in Europe.
In North America, this field is typically only available for credit-type accounts.


Format: double 
iso_currency_code
nullablestring
The ISO-4217 currency code of the balance. Always null if unofficial_currency_code is non-null.
unofficial_currency_code
nullablestring
The unofficial currency code associated with the balance. Always null if iso_currency_code is non-null. Unofficial currency codes are used for currencies that do not have official ISO currency codes, such as cryptocurrencies and the currencies of certain countries.
See the currency code schema for a full listing of supported unofficial_currency_codes.
last_updated_datetime
nullablestring
Timestamp in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) indicating the last time the balance was updated.
This field is returned only when the institution is ins_128026 (Capital One).


Format: date-time 
mask
nullablestring
The last 2-4 alphanumeric characters of either the account’s displayed mask or the account’s official account number. Note that the mask may be non-unique between an Item’s accounts.
name
string
The name of the account, either assigned by the user or by the financial institution itself
official_name
nullablestring
The official name of the account as given by the financial institution
type
string
investment: Investment account. In API versions 2018-05-22 and earlier, this type is called brokerage instead.
credit: Credit card
depository: Depository account
loan: Loan account
other: Non-specified account type
See the Account type schema for a full listing of account types and corresponding subtypes.


Possible values: investment, credit, depository, loan, brokerage, other
subtype
nullablestring
See the Account type schema for a full listing of account types and corresponding subtypes.


Possible values: 401a, 401k, 403B, 457b, 529, auto, brokerage, business, cash isa, cash management, cd, checking, commercial, construction, consumer, credit card, crypto exchange, ebt, education savings account, fixed annuity, gic, health reimbursement arrangement, home equity, hsa, isa, ira, keogh, lif, life insurance, line of credit, lira, loan, lrif, lrsp, money market, mortgage, mutual fund, non-custodial wallet, non-taxable brokerage account, other, other insurance, other annuity, overdraft, paypal, payroll, pension, prepaid, prif, profit sharing plan, rdsp, resp, retirement, rlif, roth, roth 401k, rrif, rrsp, sarsep, savings, sep ira, simple ira, sipp, stock plan, student, thrift savings plan, tfsa, trust, ugma, utma, variable annuity
verification_status
string
The current verification status of an Auth Item initiated through micro-deposits or database verification. Returned for Auth Items only.
pending_automatic_verification: The Item is pending automatic verification
pending_manual_verification: The Item is pending manual micro-deposit verification. Items remain in this state until the user successfully verifies the micro-deposit.
automatically_verified: The Item has successfully been automatically verified	
manually_verified: The Item has successfully been manually verified
verification_expired: Plaid was unable to automatically verify the deposit within 7 calendar days and will no longer attempt to validate the Item. Users may retry by submitting their information again through Link.
verification_failed: The Item failed manual micro-deposit verification because the user exhausted all 3 verification attempts. Users may retry by submitting their information again through Link. 
 unsent: The Item is pending micro-deposit verification, but Plaid has not yet sent the micro-deposit.
database_matched: The Item has successfully been verified using Plaid's data sources. Only returned for Auth Items created via Database Match.
database_insights_pass: The Item's numbers have been verified using Plaid's data sources: the routing and account number match a routing and account number of an account recognized on the Plaid network, and the account is not known by Plaid to be frozen or closed. Only returned for Auth Items created via Database Auth.
database_insights_pass_with_caution:The Item's numbers have been verified using Plaid's data sources and have some signal for being valid: the routing and account number were not recognized on the Plaid network, but the routing number is valid and the account number is a potential valid account number for that routing number. Only returned for Auth Items created via Database Auth.
database_insights_fail: The Item's numbers have been verified using Plaid's data sources and have signal for being invalid and/or have no signal for being valid. Typically this indicates that the routing number is invalid, the account number does not match the account number format associated with the routing number, or the account has been reported as closed or frozen. Only returned for Auth Items created via Database Auth.


Possible values: automatically_verified, pending_automatic_verification, pending_manual_verification, unsent, manually_verified, verification_expired, verification_failed, database_matched, database_insights_pass, database_insights_pass_with_caution, database_insights_fail
verification_name
string
The account holder name that was used for micro-deposit and/or database verification. Only returned for Auth Items created via micro-deposit or database verification. This name was manually-entered by the user during Link, unless it was otherwise provided via the user.legal_name request field in /link/token/create for the Link session that created the Item.
verification_insights
object
Insights from performing database verification for the account. Only returned for Auth Items using Database Auth.
Hide object
name_match_score
nullableinteger
Indicates the score of the name match between the given name provided during database verification (available in the verification_name field) and matched Plaid network accounts. If defined, will be a value between 0 and 100. Will be undefined if name matching was not enabled for the database verification session or if there were no eligible Plaid network matches to compare the given name with.
network_status
object
Status information about the account and routing number in the Plaid network.
Hide object
has_numbers_match
boolean
Indicates whether we found at least one matching account for the ACH account and routing number.
is_numbers_match_verified
boolean
Indicates if at least one matching account for the ACH account and routing number is already verified.
previous_returns
object
Information about known ACH returns for the account and routing number.
Hide object
has_previous_administrative_return
boolean
Indicates whether Plaid's data sources include a known administrative ACH return for account and routing number.
account_number_format
string
Indicator of account number format validity for institution.
valid: indicates that the account number has a correct format for the institution.
invalid: indicates that the account number has an incorrect format for the institution.
unknown: indicates that there was not enough information to determine whether the format is correct for the institution.


Possible values: valid, invalid, unknown
persistent_account_id
string
A unique and persistent identifier for accounts that can be used to trace multiple instances of the same account across different Items for depository accounts. This field is currently supported only for Items at institutions that use Tokenized Account Numbers (i.e., Chase and PNC, and in May 2025 US Bank). Because these accounts have a different account number each time they are linked, this field may be used instead of the account number to uniquely identify an account across multiple Items for payments use cases, helping to reduce duplicate Items or attempted fraud. In Sandbox, this field is populated for TAN-based institutions (ins_56, ins_13) as well as the OAuth Sandbox institution (ins_127287); in Production, it will only be populated for accounts at applicable institutions.
holder_category
nullablestring
Indicates the account's categorization as either a personal or a business account. This field is currently in beta; to request access, contact your account manager.


Possible values: business, personal, unrecognized
numbers
object
An object containing identifying numbers used for making electronic transfers to and from the accounts. The identifying number type (ACH, EFT, IBAN, or BACS) used will depend on the country of the account. An account may have more than one number type. If a particular identifying number type is not used by any accounts for which data has been requested, the array for that type will be empty.
Hide object
ach
[object]
An array of ACH numbers identifying accounts.
Hide object
account_id
string
The Plaid account ID associated with the account numbers
account
string
The ACH account number for the account.
At certain institutions, including Chase, PNC, and (coming May 2025) US Bank, you will receive "tokenized" routing and account numbers, which are not the user's actual account and routing numbers. For important details on how this may impact your integration and on how to avoid fraud, user confusion, and ACH returns, see Tokenized account numbers.
is_tokenized_account_number
boolean
Indicates whether the account number is tokenized by the institution. For important details on how tokenized account numbers may impact your integration, see Tokenized account numbers.
routing
string
The ACH routing number for the account. This may be a tokenized routing number. For more information, see Tokenized account numbers.
wire_routing
nullablestring
The wire transfer routing number for the account. This field is only populated if the institution is known to use a separate wire transfer routing number. Many institutions do not have a separate wire routing number and use the ACH routing number for wires instead. It is recommended to have the end user manually confirm their wire routing number before sending any wires to their account, especially if this field is null.
eft
[object]
An array of EFT numbers identifying accounts.
Hide object
account_id
string
The Plaid account ID associated with the account numbers
account
string
The EFT account number for the account
institution
string
The EFT institution number for the account
branch
string
The EFT branch number for the account
international
[object]
An array of IBAN numbers identifying accounts.
Hide object
account_id
string
The Plaid account ID associated with the account numbers
iban
string
The International Bank Account Number (IBAN) for the account
bic
string
The Bank Identifier Code (BIC) for the account
bacs
[object]
An array of BACS numbers identifying accounts.
Hide object
account_id
string
The Plaid account ID associated with the account numbers
account
string
The BACS account number for the account
sort_code
string
The BACS sort code for the account
item
object
Metadata about the Item.
Hide object
item_id
string
The Plaid Item ID. The item_id is always unique; linking the same account at the same institution twice will result in two Items with different item_id values. Like all Plaid identifiers, the item_id is case-sensitive.
institution_id
nullablestring
The Plaid Institution ID associated with the Item. Field is null for Items created without an institution connection, such as Items created via Same Day Micro-deposits.
institution_name
nullablestring
The name of the institution associated with the Item. Field is null for Items created without an institution connection, such as Items created via Same Day Micro-deposits.
webhook
nullablestring
The URL registered to receive webhooks for the Item.
auth_method
nullablestring
The method used to populate Auth data for the Item. This field is only populated for Items that have had Auth numbers data set on at least one of its accounts, and will be null otherwise. For info about the various flows, see our Auth coverage documentation.
INSTANT_AUTH: The Item's Auth data was provided directly by the user's institution connection.
INSTANT_MATCH: The Item's Auth data was provided via the Instant Match fallback flow.
AUTOMATED_MICRODEPOSITS: The Item's Auth data was provided via the Automated Micro-deposits flow.
SAME_DAY_MICRODEPOSITS: The Item's Auth data was provided via the Same Day Micro-deposits flow.
INSTANT_MICRODEPOSITS: The Item's Auth data was provided via the Instant Micro-deposits flow.
DATABASE_MATCH: The Item's Auth data was provided via the Database Match flow.
DATABASE_INSIGHTS: The Item's Auth data was provided via the Database Insights flow.
TRANSFER_MIGRATED: The Item's Auth data was provided via /transfer/migrate_account.
INVESTMENTS_FALLBACK: The Item's Auth data for Investments Move was provided via a fallback flow.


Possible values: INSTANT_AUTH, INSTANT_MATCH, AUTOMATED_MICRODEPOSITS, SAME_DAY_MICRODEPOSITS, INSTANT_MICRODEPOSITS, DATABASE_MATCH, DATABASE_INSIGHTS, TRANSFER_MIGRATED, INVESTMENTS_FALLBACK, null
error
nullableobject
Errors are identified by error_code and categorized by error_type. Use these in preference to HTTP status codes to identify and handle specific errors. HTTP status codes are set and provide the broadest categorization of errors: 4xx codes are for developer- or user-related errors, and 5xx codes are for Plaid-related errors, and the status will be 2xx in non-error cases. An Item with a non-null error object will only be part of an API response when calling /item/get to view Item status. Otherwise, error fields will be null if no error has occurred; if an error has occurred, an error code will be returned instead.
Hide object
error_type
string
A broad categorization of the error. Safe for programmatic use.


Possible values: INVALID_REQUEST, INVALID_RESULT, INVALID_INPUT, INSTITUTION_ERROR, RATE_LIMIT_EXCEEDED, API_ERROR, ITEM_ERROR, ASSET_REPORT_ERROR, RECAPTCHA_ERROR, OAUTH_ERROR, PAYMENT_ERROR, BANK_TRANSFER_ERROR, INCOME_VERIFICATION_ERROR, MICRODEPOSITS_ERROR, SANDBOX_ERROR, PARTNER_ERROR, TRANSACTIONS_ERROR, TRANSACTION_ERROR, TRANSFER_ERROR, CHECK_REPORT_ERROR, CONSUMER_REPORT_ERROR
error_code
string
The particular error code. Safe for programmatic use.
error_code_reason
nullablestring
The specific reason for the error code. Currently, reasons are only supported OAuth-based item errors; null will be returned otherwise. Safe for programmatic use.
Possible values:
OAUTH_INVALID_TOKEN: The user’s OAuth connection to this institution has been invalidated.
OAUTH_CONSENT_EXPIRED: The user's access consent for this OAuth connection to this institution has expired.
OAUTH_USER_REVOKED: The user’s OAuth connection to this institution is invalid because the user revoked their connection.
error_message
string
A developer-friendly representation of the error code. This may change over time and is not safe for programmatic use.
display_message
nullablestring
A user-friendly representation of the error code. null if the error is not related to user action.
This may change over time and is not safe for programmatic use.
request_id
string
A unique ID identifying the request, to be used for troubleshooting purposes. This field will be omitted in errors provided by webhooks.
causes
array
In this product, a request can pertain to more than one Item. If an error is returned for such a request, causes will return an array of errors containing a breakdown of these errors on the individual Item level, if any can be identified.
causes will be provided for the error_type ASSET_REPORT_ERROR or CHECK_REPORT_ERROR. causes will also not be populated inside an error nested within a warning object.
status
nullableinteger
The HTTP status code associated with the error. This will only be returned in the response body when the error information is provided via a webhook.
documentation_url
string
The URL of a Plaid documentation page with more information about the error
suggested_action
nullablestring
Suggested steps for resolving the error
available_products
[string]
A list of products available for the Item that have not yet been accessed. The contents of this array will be mutually exclusive with billed_products.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, payment_initiation, identity_verification, transactions, credit_details, income, income_verification, standing_orders, transfer, employment, recurring_transactions, transactions_refresh, signal, statements, processor_payments, processor_identity, profile, cra_base_report, cra_income_insights, cra_partner_insights, cra_network_insights, cra_cashflow_insights, cra_monitoring, layer, pay_by_bank, protect_linked_bank
billed_products
[string]
A list of products that have been billed for the Item. The contents of this array will be mutually exclusive with available_products. Note - billed_products is populated in all environments but only requests in Production are billed. Also note that products that are billed on a pay-per-call basis rather than a pay-per-Item basis, such as balance, will not appear here.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, payment_initiation, identity_verification, transactions, credit_details, income, income_verification, standing_orders, transfer, employment, recurring_transactions, transactions_refresh, signal, statements, processor_payments, processor_identity, profile, cra_base_report, cra_income_insights, cra_partner_insights, cra_network_insights, cra_cashflow_insights, cra_monitoring, layer, pay_by_bank, protect_linked_bank
products
[string]
A list of products added to the Item. In almost all cases, this will be the same as the billed_products field. For some products, it is possible for the product to be added to an Item but not yet billed (e.g. Assets, before /asset_report/create has been called, or Auth or Identity when added as Optional Products but before their endpoints have been called), in which case the product may appear in products but not in billed_products.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, payment_initiation, identity_verification, transactions, credit_details, income, income_verification, standing_orders, transfer, employment, recurring_transactions, transactions_refresh, signal, statements, processor_payments, processor_identity, profile, cra_base_report, cra_income_insights, cra_partner_insights, cra_network_insights, cra_cashflow_insights, cra_monitoring, layer, pay_by_bank, protect_linked_bank
consented_products
[string]
A list of products that the user has consented to for the Item via Data Transparency Messaging. This will consist of all products where both of the following are true: the user has consented to the required data scopes for that product and you have Production access for that product.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, transactions, income, income_verification, transfer, employment, recurring_transactions, signal, statements, processor_payments, processor_identity, cra_base_report, cra_income_insights, cra_partner_insights, cra_cashflow_insights, cra_monitoring, layer
consent_expiration_time
nullablestring
The date and time at which the Item's access consent will expire, in ISO 8601 format. If the Item does not have consent expiration scheduled, this field will be null. Currently, only institutions in Europe and a small number of institutions in the US have expiring consent. For a list of US institutions that currently expire consent, see the OAuth Guide. Closer to the 1033 compliance deadline of April 1, 2026, expiration times will be populated more widely. For more details on 1033-related consent expiration that may be enforced in the future, see Data Transparency Messaging consent expiration.


Format: date-time 
update_type
string
Indicates whether an Item requires user interaction to be updated, which can be the case for Items with some forms of two-factor authentication.
background - Item can be updated in the background
user_present_required - Item requires user interaction to be updated


Possible values: background, user_present_required
request_id
string
A unique identifier for the request, which can be used for troubleshooting. This identifier, like all Plaid identifiers, is case sensitive.


Auth
API reference for Auth endpoints and webhooks
Retrieve bank account information to set up electronic funds transfers, such as ACH payments in the US, EFT payments in Canada, BACS payments in the UK, and IBAN / SIC payments in the EU.
For how-to guidance, see the Auth documentation.
Endpoints
/auth/get
Fetch account information
/bank_transfer/event/list
Search for updates on micro-deposit verification statuses based on filter criteria
/bank_transfer/event/sync
Get updates on micro-deposit verification statuses using a cursor
See also
/processor/token/create
Create a token for using Auth with a processing partner
/sandbox/processor_token/create
Create a token for testing Auth with a processing partner
/processor/stripe/bank_account_token/create
Create a token for using Auth with Stripe as a processing partner
/sandbox/item/set_verification_status
Change a Sandbox Item's micro-deposit verification status
Webhooks
DEFAULT_UPDATE
Item has account(s) with updated Auth data
AUTOMATICALLY_VERIFIED
Item has been verified
VERIFICATION_EXPIRED
Item verification has failed
BANK_TRANSFERS_EVENTS_UPDATE
New micro-deposit verification events available
SMS_MICRODEPOSITS_VERIFICATION
Text message verification status has changed
Endpoints
/auth/get
Retrieve auth data
The /auth/get endpoint returns the bank account and bank identification numbers (such as routing numbers, for US accounts) associated with an Item's checking, savings, and cash management accounts, along with high-level account data and balances when available.
Versioning note: In API version 2017-03-08, the schema of the numbers object returned by this endpoint is substantially different. For details, see Plaid API versioning.
Request fields
Collapse all
client_id
string
Your Plaid API client_id. The client_id is required and may be provided either in the PLAID-CLIENT-ID header or as part of a request body.
secret
string
Your Plaid API secret. The secret is required and may be provided either in the PLAID-SECRET header or as part of a request body.
access_token
requiredstring
The access token associated with the Item data is being requested for.
options
object
An optional object to filter /auth/get results.
Hide object
account_ids
[string]
A list of account_ids to retrieve for the Item.
Note: An error will be returned if a provided account_id is not associated with the Item.
Select group for content switcher
Current librariesLegacy libraries
const request: AuthGetRequest = {
  access_token: accessToken,
};
try {
  const response = await plaidClient.authGet(request);
  const accountData = response.data.accounts;
  const numbers = response.data.numbers;
} catch (error) {
  // handle error
}
Response fields and example
Collapse all
accounts
[object]
The accounts for which numbers are being retrieved.
Hide object
account_id
string
Plaid’s unique identifier for the account. This value will not change unless Plaid can't reconcile the account with the data returned by the financial institution. This may occur, for example, when the name of the account changes. If this happens a new account_id will be assigned to the account.
The account_id can also change if the access_token is deleted and the same credentials that were used to generate that access_token are used to generate a new access_token on a later date. In that case, the new account_id will be different from the old account_id.
If an account with a specific account_id disappears instead of changing, the account is likely closed. Closed accounts are not returned by the Plaid API.
When using a CRA endpoint (an endpoint associated with Plaid Check Consumer Report, i.e. any endpoint beginning with /cra/), the account_id returned will not match the account_id returned by a non-CRA endpoint.
Like all Plaid identifiers, the account_id is case sensitive.
balances
object
A set of fields describing the balance for an account. Balance information may be cached unless the balance object was returned by /accounts/balance/get.
Hide object
available
nullablenumber
The amount of funds available to be withdrawn from the account, as determined by the financial institution.
For credit-type accounts, the available balance typically equals the limit less the current balance, less any pending outflows plus any pending inflows.
For depository-type accounts, the available balance typically equals the current balance less any pending outflows plus any pending inflows. For depository-type accounts, the available balance does not include the overdraft limit.
For investment-type accounts (or brokerage-type accounts for API versions 2018-05-22 and earlier), the available balance is the total cash available to withdraw as presented by the institution.
Note that not all institutions calculate the available  balance. In the event that available balance is unavailable, Plaid will return an available balance value of null.
Available balance may be cached and is not guaranteed to be up-to-date in realtime unless the value was returned by /accounts/balance/get.
If current is null this field is guaranteed not to be null.


Format: double 
current
nullablenumber
The total amount of funds in or owed by the account.
For credit-type accounts, a positive balance indicates the amount owed; a negative amount indicates the lender owing the account holder.
For loan-type accounts, the current balance is the principal remaining on the loan, except in the case of student loan accounts at Sallie Mae (ins_116944). For Sallie Mae student loans, the account's balance includes both principal and any outstanding interest. Similar to credit-type accounts, a positive balance is typically expected, while a negative amount indicates the lender owing the account holder.
For investment-type accounts (or brokerage-type accounts for API versions 2018-05-22 and earlier), the current balance is the total value of assets as presented by the institution.
Note that balance information may be cached unless the value was returned by /accounts/balance/get; if the Item is enabled for Transactions, the balance will be at least as recent as the most recent Transaction update. If you require realtime balance information, use the available balance as provided by /accounts/balance/get.
When returned by /accounts/balance/get, this field may be null. When this happens, available is guaranteed not to be null.


Format: double 
limit
nullablenumber
For credit-type accounts, this represents the credit limit.
For depository-type accounts, this represents the pre-arranged overdraft limit, which is common for current (checking) accounts in Europe.
In North America, this field is typically only available for credit-type accounts.


Format: double 
iso_currency_code
nullablestring
The ISO-4217 currency code of the balance. Always null if unofficial_currency_code is non-null.
unofficial_currency_code
nullablestring
The unofficial currency code associated with the balance. Always null if iso_currency_code is non-null. Unofficial currency codes are used for currencies that do not have official ISO currency codes, such as cryptocurrencies and the currencies of certain countries.
See the currency code schema for a full listing of supported unofficial_currency_codes.
last_updated_datetime
nullablestring
Timestamp in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) indicating the last time the balance was updated.
This field is returned only when the institution is ins_128026 (Capital One).


Format: date-time 
mask
nullablestring
The last 2-4 alphanumeric characters of either the account’s displayed mask or the account’s official account number. Note that the mask may be non-unique between an Item’s accounts.
name
string
The name of the account, either assigned by the user or by the financial institution itself
official_name
nullablestring
The official name of the account as given by the financial institution
type
string
investment: Investment account. In API versions 2018-05-22 and earlier, this type is called brokerage instead.
credit: Credit card
depository: Depository account
loan: Loan account
other: Non-specified account type
See the Account type schema for a full listing of account types and corresponding subtypes.


Possible values: investment, credit, depository, loan, brokerage, other
subtype
nullablestring
See the Account type schema for a full listing of account types and corresponding subtypes.


Possible values: 401a, 401k, 403B, 457b, 529, auto, brokerage, business, cash isa, cash management, cd, checking, commercial, construction, consumer, credit card, crypto exchange, ebt, education savings account, fixed annuity, gic, health reimbursement arrangement, home equity, hsa, isa, ira, keogh, lif, life insurance, line of credit, lira, loan, lrif, lrsp, money market, mortgage, mutual fund, non-custodial wallet, non-taxable brokerage account, other, other insurance, other annuity, overdraft, paypal, payroll, pension, prepaid, prif, profit sharing plan, rdsp, resp, retirement, rlif, roth, roth 401k, rrif, rrsp, sarsep, savings, sep ira, simple ira, sipp, stock plan, student, thrift savings plan, tfsa, trust, ugma, utma, variable annuity
verification_status
string
The current verification status of an Auth Item initiated through micro-deposits or database verification. Returned for Auth Items only.
pending_automatic_verification: The Item is pending automatic verification
pending_manual_verification: The Item is pending manual micro-deposit verification. Items remain in this state until the user successfully verifies the micro-deposit.
automatically_verified: The Item has successfully been automatically verified	
manually_verified: The Item has successfully been manually verified
verification_expired: Plaid was unable to automatically verify the deposit within 7 calendar days and will no longer attempt to validate the Item. Users may retry by submitting their information again through Link.
verification_failed: The Item failed manual micro-deposit verification because the user exhausted all 3 verification attempts. Users may retry by submitting their information again through Link. 
 unsent: The Item is pending micro-deposit verification, but Plaid has not yet sent the micro-deposit.
database_matched: The Item has successfully been verified using Plaid's data sources. Only returned for Auth Items created via Database Match.
database_insights_pass: The Item's numbers have been verified using Plaid's data sources: the routing and account number match a routing and account number of an account recognized on the Plaid network, and the account is not known by Plaid to be frozen or closed. Only returned for Auth Items created via Database Auth.
database_insights_pass_with_caution:The Item's numbers have been verified using Plaid's data sources and have some signal for being valid: the routing and account number were not recognized on the Plaid network, but the routing number is valid and the account number is a potential valid account number for that routing number. Only returned for Auth Items created via Database Auth.
database_insights_fail: The Item's numbers have been verified using Plaid's data sources and have signal for being invalid and/or have no signal for being valid. Typically this indicates that the routing number is invalid, the account number does not match the account number format associated with the routing number, or the account has been reported as closed or frozen. Only returned for Auth Items created via Database Auth.


Possible values: automatically_verified, pending_automatic_verification, pending_manual_verification, unsent, manually_verified, verification_expired, verification_failed, database_matched, database_insights_pass, database_insights_pass_with_caution, database_insights_fail
verification_name
string
The account holder name that was used for micro-deposit and/or database verification. Only returned for Auth Items created via micro-deposit or database verification. This name was manually-entered by the user during Link, unless it was otherwise provided via the user.legal_name request field in /link/token/create for the Link session that created the Item.
verification_insights
object
Insights from performing database verification for the account. Only returned for Auth Items using Database Auth.
Hide object
name_match_score
nullableinteger
Indicates the score of the name match between the given name provided during database verification (available in the verification_name field) and matched Plaid network accounts. If defined, will be a value between 0 and 100. Will be undefined if name matching was not enabled for the database verification session or if there were no eligible Plaid network matches to compare the given name with.
network_status
object
Status information about the account and routing number in the Plaid network.
Hide object
has_numbers_match
boolean
Indicates whether we found at least one matching account for the ACH account and routing number.
is_numbers_match_verified
boolean
Indicates if at least one matching account for the ACH account and routing number is already verified.
previous_returns
object
Information about known ACH returns for the account and routing number.
Hide object
has_previous_administrative_return
boolean
Indicates whether Plaid's data sources include a known administrative ACH return for account and routing number.
account_number_format
string
Indicator of account number format validity for institution.
valid: indicates that the account number has a correct format for the institution.
invalid: indicates that the account number has an incorrect format for the institution.
unknown: indicates that there was not enough information to determine whether the format is correct for the institution.


Possible values: valid, invalid, unknown
persistent_account_id
string
A unique and persistent identifier for accounts that can be used to trace multiple instances of the same account across different Items for depository accounts. This field is currently supported only for Items at institutions that use Tokenized Account Numbers (i.e., Chase and PNC, and in May 2025 US Bank). Because these accounts have a different account number each time they are linked, this field may be used instead of the account number to uniquely identify an account across multiple Items for payments use cases, helping to reduce duplicate Items or attempted fraud. In Sandbox, this field is populated for TAN-based institutions (ins_56, ins_13) as well as the OAuth Sandbox institution (ins_127287); in Production, it will only be populated for accounts at applicable institutions.
holder_category
nullablestring
Indicates the account's categorization as either a personal or a business account. This field is currently in beta; to request access, contact your account manager.


Possible values: business, personal, unrecognized
numbers
object
An object containing identifying numbers used for making electronic transfers to and from the accounts. The identifying number type (ACH, EFT, IBAN, or BACS) used will depend on the country of the account. An account may have more than one number type. If a particular identifying number type is not used by any accounts for which data has been requested, the array for that type will be empty.
Hide object
ach
[object]
An array of ACH numbers identifying accounts.
Hide object
account_id
string
The Plaid account ID associated with the account numbers
account
string
The ACH account number for the account.
At certain institutions, including Chase, PNC, and (coming May 2025) US Bank, you will receive "tokenized" routing and account numbers, which are not the user's actual account and routing numbers. For important details on how this may impact your integration and on how to avoid fraud, user confusion, and ACH returns, see Tokenized account numbers.
is_tokenized_account_number
boolean
Indicates whether the account number is tokenized by the institution. For important details on how tokenized account numbers may impact your integration, see Tokenized account numbers.
routing
string
The ACH routing number for the account. This may be a tokenized routing number. For more information, see Tokenized account numbers.
wire_routing
nullablestring
The wire transfer routing number for the account. This field is only populated if the institution is known to use a separate wire transfer routing number. Many institutions do not have a separate wire routing number and use the ACH routing number for wires instead. It is recommended to have the end user manually confirm their wire routing number before sending any wires to their account, especially if this field is null.
eft
[object]
An array of EFT numbers identifying accounts.
Hide object
account_id
string
The Plaid account ID associated with the account numbers
account
string
The EFT account number for the account
institution
string
The EFT institution number for the account
branch
string
The EFT branch number for the account
international
[object]
An array of IBAN numbers identifying accounts.
Hide object
account_id
string
The Plaid account ID associated with the account numbers
iban
string
The International Bank Account Number (IBAN) for the account
bic
string
The Bank Identifier Code (BIC) for the account
bacs
[object]
An array of BACS numbers identifying accounts.
Hide object
account_id
string
The Plaid account ID associated with the account numbers
account
string
The BACS account number for the account
sort_code
string
The BACS sort code for the account
item
object
Metadata about the Item.
Hide object
item_id
string
The Plaid Item ID. The item_id is always unique; linking the same account at the same institution twice will result in two Items with different item_id values. Like all Plaid identifiers, the item_id is case-sensitive.
institution_id
nullablestring
The Plaid Institution ID associated with the Item. Field is null for Items created without an institution connection, such as Items created via Same Day Micro-deposits.
institution_name
nullablestring
The name of the institution associated with the Item. Field is null for Items created without an institution connection, such as Items created via Same Day Micro-deposits.
webhook
nullablestring
The URL registered to receive webhooks for the Item.
auth_method
nullablestring
The method used to populate Auth data for the Item. This field is only populated for Items that have had Auth numbers data set on at least one of its accounts, and will be null otherwise. For info about the various flows, see our Auth coverage documentation.
INSTANT_AUTH: The Item's Auth data was provided directly by the user's institution connection.
INSTANT_MATCH: The Item's Auth data was provided via the Instant Match fallback flow.
AUTOMATED_MICRODEPOSITS: The Item's Auth data was provided via the Automated Micro-deposits flow.
SAME_DAY_MICRODEPOSITS: The Item's Auth data was provided via the Same Day Micro-deposits flow.
INSTANT_MICRODEPOSITS: The Item's Auth data was provided via the Instant Micro-deposits flow.
DATABASE_MATCH: The Item's Auth data was provided via the Database Match flow.
DATABASE_INSIGHTS: The Item's Auth data was provided via the Database Insights flow.
TRANSFER_MIGRATED: The Item's Auth data was provided via /transfer/migrate_account.
INVESTMENTS_FALLBACK: The Item's Auth data for Investments Move was provided via a fallback flow.


Possible values: INSTANT_AUTH, INSTANT_MATCH, AUTOMATED_MICRODEPOSITS, SAME_DAY_MICRODEPOSITS, INSTANT_MICRODEPOSITS, DATABASE_MATCH, DATABASE_INSIGHTS, TRANSFER_MIGRATED, INVESTMENTS_FALLBACK, null
error
nullableobject
Errors are identified by error_code and categorized by error_type. Use these in preference to HTTP status codes to identify and handle specific errors. HTTP status codes are set and provide the broadest categorization of errors: 4xx codes are for developer- or user-related errors, and 5xx codes are for Plaid-related errors, and the status will be 2xx in non-error cases. An Item with a non-null error object will only be part of an API response when calling /item/get to view Item status. Otherwise, error fields will be null if no error has occurred; if an error has occurred, an error code will be returned instead.
Hide object
error_type
string
A broad categorization of the error. Safe for programmatic use.


Possible values: INVALID_REQUEST, INVALID_RESULT, INVALID_INPUT, INSTITUTION_ERROR, RATE_LIMIT_EXCEEDED, API_ERROR, ITEM_ERROR, ASSET_REPORT_ERROR, RECAPTCHA_ERROR, OAUTH_ERROR, PAYMENT_ERROR, BANK_TRANSFER_ERROR, INCOME_VERIFICATION_ERROR, MICRODEPOSITS_ERROR, SANDBOX_ERROR, PARTNER_ERROR, TRANSACTIONS_ERROR, TRANSACTION_ERROR, TRANSFER_ERROR, CHECK_REPORT_ERROR, CONSUMER_REPORT_ERROR
error_code
string
The particular error code. Safe for programmatic use.
error_code_reason
nullablestring
The specific reason for the error code. Currently, reasons are only supported OAuth-based item errors; null will be returned otherwise. Safe for programmatic use.
Possible values:
OAUTH_INVALID_TOKEN: The user’s OAuth connection to this institution has been invalidated.
OAUTH_CONSENT_EXPIRED: The user's access consent for this OAuth connection to this institution has expired.
OAUTH_USER_REVOKED: The user’s OAuth connection to this institution is invalid because the user revoked their connection.
error_message
string
A developer-friendly representation of the error code. This may change over time and is not safe for programmatic use.
display_message
nullablestring
A user-friendly representation of the error code. null if the error is not related to user action.
This may change over time and is not safe for programmatic use.
request_id
string
A unique ID identifying the request, to be used for troubleshooting purposes. This field will be omitted in errors provided by webhooks.
causes
array
In this product, a request can pertain to more than one Item. If an error is returned for such a request, causes will return an array of errors containing a breakdown of these errors on the individual Item level, if any can be identified.
causes will be provided for the error_type ASSET_REPORT_ERROR or CHECK_REPORT_ERROR. causes will also not be populated inside an error nested within a warning object.
status
nullableinteger
The HTTP status code associated with the error. This will only be returned in the response body when the error information is provided via a webhook.
documentation_url
string
The URL of a Plaid documentation page with more information about the error
suggested_action
nullablestring
Suggested steps for resolving the error
available_products
[string]
A list of products available for the Item that have not yet been accessed. The contents of this array will be mutually exclusive with billed_products.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, payment_initiation, identity_verification, transactions, credit_details, income, income_verification, standing_orders, transfer, employment, recurring_transactions, transactions_refresh, signal, statements, processor_payments, processor_identity, profile, cra_base_report, cra_income_insights, cra_partner_insights, cra_network_insights, cra_cashflow_insights, cra_monitoring, layer, pay_by_bank, protect_linked_bank
billed_products
[string]
A list of products that have been billed for the Item. The contents of this array will be mutually exclusive with available_products. Note - billed_products is populated in all environments but only requests in Production are billed. Also note that products that are billed on a pay-per-call basis rather than a pay-per-Item basis, such as balance, will not appear here.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, payment_initiation, identity_verification, transactions, credit_details, income, income_verification, standing_orders, transfer, employment, recurring_transactions, transactions_refresh, signal, statements, processor_payments, processor_identity, profile, cra_base_report, cra_income_insights, cra_partner_insights, cra_network_insights, cra_cashflow_insights, cra_monitoring, layer, pay_by_bank, protect_linked_bank
products
[string]
A list of products added to the Item. In almost all cases, this will be the same as the billed_products field. For some products, it is possible for the product to be added to an Item but not yet billed (e.g. Assets, before /asset_report/create has been called, or Auth or Identity when added as Optional Products but before their endpoints have been called), in which case the product may appear in products but not in billed_products.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, payment_initiation, identity_verification, transactions, credit_details, income, income_verification, standing_orders, transfer, employment, recurring_transactions, transactions_refresh, signal, statements, processor_payments, processor_identity, profile, cra_base_report, cra_income_insights, cra_partner_insights, cra_network_insights, cra_cashflow_insights, cra_monitoring, layer, pay_by_bank, protect_linked_bank
consented_products
[string]
A list of products that the user has consented to for the Item via Data Transparency Messaging. This will consist of all products where both of the following are true: the user has consented to the required data scopes for that product and you have Production access for that product.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, transactions, income, income_verification, transfer, employment, recurring_transactions, signal, statements, processor_payments, processor_identity, cra_base_report, cra_income_insights, cra_partner_insights, cra_cashflow_insights, cra_monitoring, layer
consent_expiration_time
nullablestring
The date and time at which the Item's access consent will expire, in ISO 8601 format. If the Item does not have consent expiration scheduled, this field will be null. Currently, only institutions in Europe and a small number of institutions in the US have expiring consent. For a list of US institutions that currently expire consent, see the OAuth Guide. Closer to the 1033 compliance deadline of April 1, 2026, expiration times will be populated more widely. For more details on 1033-related consent expiration that may be enforced in the future, see Data Transparency Messaging consent expiration.


Format: date-time 
update_type
string
Indicates whether an Item requires user interaction to be updated, which can be the case for Items with some forms of two-factor authentication.
background - Item can be updated in the background
user_present_required - Item requires user interaction to be updated


Possible values: background, user_present_required
request_id
string
A unique identifier for the request, which can be used for troubleshooting. This identifier, like all Plaid identifiers, is case sensitive.


/bank_transfer/event/list
List bank transfer events
Use the /bank_transfer/event/list endpoint to get a list of Plaid-initiated ACH or bank transfer events based on specified filter criteria. When using Auth with micro-deposit verification enabled, this endpoint can be used to fetch status updates on ACH micro-deposits. For more details, see micro-deposit events.
Request fields
client_id
string
Your Plaid API client_id. The client_id is required and may be provided either in the PLAID-CLIENT-ID header or as part of a request body.
secret
string
Your Plaid API secret. The secret is required and may be provided either in the PLAID-SECRET header or as part of a request body.
start_date
string
The start datetime of bank transfers to list. This should be in RFC 3339 format (i.e. 2019-12-06T22:35:49Z)


Format: date-time 
end_date
string
The end datetime of bank transfers to list. This should be in RFC 3339 format (i.e. 2019-12-06T22:35:49Z)


Format: date-time 
bank_transfer_id
string
Plaid’s unique identifier for a bank transfer.
account_id
string
The account ID to get events for all transactions to/from an account.
bank_transfer_type
string
The type of bank transfer. This will be either debit or credit.  A debit indicates a transfer of money into your origination account; a credit indicates a transfer of money out of your origination account.


Possible values: debit, credit, null
event_types
[string]
Filter events by event type.


Possible values: pending, cancelled, failed, posted, reversed
count
integer
The maximum number of bank transfer events to return. If the number of events matching the above parameters is greater than count, the most recent events will be returned.


Default: 25 
Maximum: 25 
Minimum: 1 
offset
integer
The offset into the list of bank transfer events. When count=25 and offset=0, the first 25 events will be returned. When count=25 and offset=25, the next 25 bank transfer events will be returned.


Default: 0 
Minimum: 0 
origination_account_id
string
The origination account ID to get events for transfers from a specific origination account.
direction
string
Indicates the direction of the transfer: outbound: for API-initiated transfers
inbound: for payments received by the FBO account.


Possible values: inbound, outbound, null
Select group for content switcher
Current librariesLegacy libraries
const request: BankTransferEventListRequest = {
  start_date: start_date,
  end_date: end_date,
  bank_transfer_id: bank_transfer_id,
  account_id: account_id,
  bank_transfer_type: bank_transfer_type,
  event_types: event_types,
  count: count,
  offset: offset,
  origination_account_id: origination_account_id,
  direction: direction,
};
try {
  const response = await plaidClient.bankTransferEventList(request);
  const events = response.data.bank_transfer_events;
  for (const event of events) {
    // iterate through events
  }
} catch (error) {
  // handle error
}
Response fields and example
Collapse all
bank_transfer_events
[object]
Hide object
event_id
integer
Plaid’s unique identifier for this event. IDs are sequential unsigned 64-bit integers.


Minimum: 0 
timestamp
string
The datetime when this event occurred. This will be of the form 2006-01-02T15:04:05Z.


Format: date-time 
event_type
string
The type of event that this bank transfer represents.
pending: A new transfer was created; it is in the pending state.
cancelled: The transfer was cancelled by the client.
failed: The transfer failed, no funds were moved.
posted: The transfer has been successfully submitted to the payment network.
reversed: A posted transfer was reversed.


Possible values: pending, cancelled, failed, posted, reversed
account_id
string
The account ID associated with the bank transfer.
bank_transfer_id
string
Plaid’s unique identifier for a bank transfer.
origination_account_id
nullablestring
The ID of the origination account that this balance belongs to.
bank_transfer_type
string
The type of bank transfer. This will be either debit or credit.  A debit indicates a transfer of money into the origination account; a credit indicates a transfer of money out of the origination account.


Possible values: debit, credit
bank_transfer_amount
string
The bank transfer amount.
bank_transfer_iso_currency_code
string
The currency of the bank transfer amount.
failure_reason
nullableobject
The failure reason if the type of this transfer is "failed" or "reversed". Null value otherwise.
Hide object
ach_return_code
nullablestring
The ACH return code, e.g. R01.  A return code will be provided if and only if the transfer status is reversed. For a full listing of ACH return codes, see Bank Transfers errors.
description
string
A human-readable description of the reason for the failure or reversal.
direction
nullablestring
Indicates the direction of the transfer: outbound for API-initiated transfers, or inbound for payments received by the FBO account.


Possible values: outbound, inbound, null
request_id
string
A unique identifier for the request, which can be used for troubleshooting. This identifier, like all Plaid identifiers, is case sensitive.

{
  "bank_transfer_events": [
    {
      "account_id": "6qL6lWoQkAfNE3mB8Kk5tAnvpX81qefrvvl7B",
      "bank_transfer_amount": "12.34",
      "bank_transfer_id": "460cbe92-2dcc-8eae-5ad6-b37d0ec90fd9",
      "bank_transfer_iso_currency_code": "USD",
      "bank_transfer_type": "credit",
      "direction": "outbound",
      "event_id": 1,
      "event_type": "pending",
      "failure_reason": null,
      "origination_account_id": "",
      "timestamp": "2020-08-06T17:27:15Z"
    }
  ],
  "request_id": "mdqfuVxeoza6mhu"
}

/bank_transfer/event/sync
Sync bank transfer events
/bank_transfer/event/sync allows you to request up to the next 25 Plaid-initiated bank transfer events that happened after a specific event_id. When using Auth with micro-deposit verification enabled, this endpoint can be used to fetch status updates on ACH micro-deposits. For more details, see micro-deposit events.
Request fields
client_id
string
Your Plaid API client_id. The client_id is required and may be provided either in the PLAID-CLIENT-ID header or as part of a request body.
secret
string
Your Plaid API secret. The secret is required and may be provided either in the PLAID-SECRET header or as part of a request body.
after_id
requiredinteger
The latest (largest) event_id fetched via the sync endpoint, or 0 initially.


Minimum: 0 
count
integer
The maximum number of bank transfer events to return.


Default: 25 
Minimum: 1 
Maximum: 25 
Select group for content switcher
Current librariesLegacy libraries
const request: BankTransferEventListRequest = {
  after_id: afterID,
  count: 25,
};
try {
  const response = await plaidClient.bankTransferEventSync(request);
  const events = response.data.bank_transfer_events;
  for (const event of events) {
    // iterate through events
  }
} catch (error) {
  // handle error
}
Response fields and example
Collapse all
bank_transfer_events
[object]
Hide object
event_id
integer
Plaid’s unique identifier for this event. IDs are sequential unsigned 64-bit integers.


Minimum: 0 
timestamp
string
The datetime when this event occurred. This will be of the form 2006-01-02T15:04:05Z.


Format: date-time 
event_type
string
The type of event that this bank transfer represents.
pending: A new transfer was created; it is in the pending state.
cancelled: The transfer was cancelled by the client.
failed: The transfer failed, no funds were moved.
posted: The transfer has been successfully submitted to the payment network.
reversed: A posted transfer was reversed.


Possible values: pending, cancelled, failed, posted, reversed
account_id
string
The account ID associated with the bank transfer.
bank_transfer_id
string
Plaid’s unique identifier for a bank transfer.
origination_account_id
nullablestring
The ID of the origination account that this balance belongs to.
bank_transfer_type
string
The type of bank transfer. This will be either debit or credit.  A debit indicates a transfer of money into the origination account; a credit indicates a transfer of money out of the origination account.


Possible values: debit, credit
bank_transfer_amount
string
The bank transfer amount.
bank_transfer_iso_currency_code
string
The currency of the bank transfer amount.
failure_reason
nullableobject
The failure reason if the type of this transfer is "failed" or "reversed". Null value otherwise.
Hide object
ach_return_code
nullablestring
The ACH return code, e.g. R01.  A return code will be provided if and only if the transfer status is reversed. For a full listing of ACH return codes, see Bank Transfers errors.
description
string
A human-readable description of the reason for the failure or reversal.
direction
nullablestring
Indicates the direction of the transfer: outbound for API-initiated transfers, or inbound for payments received by the FBO account.


Possible values: outbound, inbound, null
request_id
string
A unique identifier for the request, which can be used for troubleshooting. This identifier, like all Plaid identifiers, is case sensitive.

{
  "bank_transfer_events": [
    {
      "account_id": "6qL6lWoQkAfNE3mB8Kk5tAnvpX81qefrvvl7B",
      "bank_transfer_amount": "12.34",
      "bank_transfer_id": "460cbe92-2dcc-8eae-5ad6-b37d0ec90fd9",
      "bank_transfer_iso_currency_code": "USD",
      "bank_transfer_type": "credit",
      "direction": "outbound",
      "event_id": 1,
      "event_type": "pending",
      "failure_reason": null,
      "origination_account_id": "",
      "timestamp": "2020-08-06T17:27:15Z"
    }
  ],
  "request_id": "mdqfuVxeoza6mhu"
}

DEFAULT_UPDATE
Plaid will trigger a DEFAULT_UPDATE webhook for Items that undergo a change in Auth data. This is generally caused by data partners notifying Plaid of a change in their account numbering system or to their routing numbers. To avoid returned transactions, customers that receive a DEFAULT_UPDATE webhook with the account_ids_with_updated_auth object populated should immediately discontinue all usages of existing Auth data for those accounts and call /auth/get or /processor/auth/get to obtain updated account and routing numbers.
Properties
Collapse all
webhook_type
string
AUTH
webhook_code
string
DEFAULT_UPDATE
item_id
string
The item_id of the Item associated with this webhook, warning, or error
account_ids_with_new_auth
[string]
An array of account_id's for accounts that contain new auth.
account_ids_with_updated_auth
object
An object with keys of account_id's that are mapped to their respective auth attributes that changed. ACCOUNT_NUMBER and ROUTING_NUMBER are the two potential values that can be flagged as updated.
Example: { "XMBvvyMGQ1UoLbKByoMqH3nXMj84ALSdE5B58": ["ACCOUNT_NUMBER"] }
error
object
Errors are identified by error_code and categorized by error_type. Use these in preference to HTTP status codes to identify and handle specific errors. HTTP status codes are set and provide the broadest categorization of errors: 4xx codes are for developer- or user-related errors, and 5xx codes are for Plaid-related errors, and the status will be 2xx in non-error cases. An Item with a non-null error object will only be part of an API response when calling /item/get to view Item status. Otherwise, error fields will be null if no error has occurred; if an error has occurred, an error code will be returned instead.
Hide object
error_type
string
A broad categorization of the error. Safe for programmatic use.


Possible values: INVALID_REQUEST, INVALID_RESULT, INVALID_INPUT, INSTITUTION_ERROR, RATE_LIMIT_EXCEEDED, API_ERROR, ITEM_ERROR, ASSET_REPORT_ERROR, RECAPTCHA_ERROR, OAUTH_ERROR, PAYMENT_ERROR, BANK_TRANSFER_ERROR, INCOME_VERIFICATION_ERROR, MICRODEPOSITS_ERROR, SANDBOX_ERROR, PARTNER_ERROR, TRANSACTIONS_ERROR, TRANSACTION_ERROR, TRANSFER_ERROR, CHECK_REPORT_ERROR, CONSUMER_REPORT_ERROR
error_code
string
The particular error code. Safe for programmatic use.
error_code_reason
string
The specific reason for the error code. Currently, reasons are only supported OAuth-based item errors; null will be returned otherwise. Safe for programmatic use.
Possible values:
OAUTH_INVALID_TOKEN: The user’s OAuth connection to this institution has been invalidated.
OAUTH_CONSENT_EXPIRED: The user's access consent for this OAuth connection to this institution has expired.
OAUTH_USER_REVOKED: The user’s OAuth connection to this institution is invalid because the user revoked their connection.
error_message
string
A developer-friendly representation of the error code. This may change over time and is not safe for programmatic use.
display_message
string
A user-friendly representation of the error code. null if the error is not related to user action.
This may change over time and is not safe for programmatic use.
request_id
string
A unique ID identifying the request, to be used for troubleshooting purposes. This field will be omitted in errors provided by webhooks.
causes
array
In this product, a request can pertain to more than one Item. If an error is returned for such a request, causes will return an array of errors containing a breakdown of these errors on the individual Item level, if any can be identified.
causes will be provided for the error_type ASSET_REPORT_ERROR or CHECK_REPORT_ERROR. causes will also not be populated inside an error nested within a warning object.
status
integer
The HTTP status code associated with the error. This will only be returned in the response body when the error information is provided via a webhook.
documentation_url
string
The URL of a Plaid documentation page with more information about the error
suggested_action
string
Suggested steps for resolving the error
environment
string
The Plaid environment the webhook was sent from


Possible values: sandbox, production

{
  "webhook_type": "AUTH",
  "webhook_code": "DEFAULT_UPDATE",
  "item_id": "wz666MBjYWTp2PDzzggYhM6oWWmBb",
  "account_ids_with_updated_auth": {
    "BxBXxLj1m4HMXBm9WZZmCWVbPjX16EHwv99vp": [
      "ACCOUNT_NUMBER"
    ]
  },
  "error": null,
  "environment": "production"
}

AUTOMATICALLY_VERIFIED
Fired when an Item is verified via automated micro-deposits. We recommend communicating to your users when this event is received to notify them that their account is verified and ready for use.
Properties
Collapse all
webhook_type
string
AUTH
webhook_code
string
AUTOMATICALLY_VERIFIED
account_id
string
The account_id of the account associated with the webhook
item_id
string
The item_id of the Item associated with this webhook, warning, or error
environment
string
The Plaid environment the webhook was sent from


Possible values: sandbox, production
error
object
Errors are identified by error_code and categorized by error_type. Use these in preference to HTTP status codes to identify and handle specific errors. HTTP status codes are set and provide the broadest categorization of errors: 4xx codes are for developer- or user-related errors, and 5xx codes are for Plaid-related errors, and the status will be 2xx in non-error cases. An Item with a non-null error object will only be part of an API response when calling /item/get to view Item status. Otherwise, error fields will be null if no error has occurred; if an error has occurred, an error code will be returned instead.
Hide object
error_type
string
A broad categorization of the error. Safe for programmatic use.


Possible values: INVALID_REQUEST, INVALID_RESULT, INVALID_INPUT, INSTITUTION_ERROR, RATE_LIMIT_EXCEEDED, API_ERROR, ITEM_ERROR, ASSET_REPORT_ERROR, RECAPTCHA_ERROR, OAUTH_ERROR, PAYMENT_ERROR, BANK_TRANSFER_ERROR, INCOME_VERIFICATION_ERROR, MICRODEPOSITS_ERROR, SANDBOX_ERROR, PARTNER_ERROR, TRANSACTIONS_ERROR, TRANSACTION_ERROR, TRANSFER_ERROR, CHECK_REPORT_ERROR, CONSUMER_REPORT_ERROR
error_code
string
The particular error code. Safe for programmatic use.
error_code_reason
string
The specific reason for the error code. Currently, reasons are only supported OAuth-based item errors; null will be returned otherwise. Safe for programmatic use.
Possible values:
OAUTH_INVALID_TOKEN: The user’s OAuth connection to this institution has been invalidated.
OAUTH_CONSENT_EXPIRED: The user's access consent for this OAuth connection to this institution has expired.
OAUTH_USER_REVOKED: The user’s OAuth connection to this institution is invalid because the user revoked their connection.
error_message
string
A developer-friendly representation of the error code. This may change over time and is not safe for programmatic use.
display_message
string
A user-friendly representation of the error code. null if the error is not related to user action.
This may change over time and is not safe for programmatic use.
request_id
string
A unique ID identifying the request, to be used for troubleshooting purposes. This field will be omitted in errors provided by webhooks.
causes
array
In this product, a request can pertain to more than one Item. If an error is returned for such a request, causes will return an array of errors containing a breakdown of these errors on the individual Item level, if any can be identified.
causes will be provided for the error_type ASSET_REPORT_ERROR or CHECK_REPORT_ERROR. causes will also not be populated inside an error nested within a warning object.
status
integer
The HTTP status code associated with the error. This will only be returned in the response body when the error information is provided via a webhook.
documentation_url
string
The URL of a Plaid documentation page with more information about the error
suggested_action

{
  "webhook_type": "AUTH",
  "webhook_code": "AUTOMATICALLY_VERIFIED",
  "item_id": "eVBnVMp7zdTJLkRNr33Rs6zr7KNJqBFL9DrE6",
  "account_id": "dVzbVMLjrxTnLjX4G66XUp5GLklm4oiZy88yK",
  "environment": "production",
  "error": null
}

Balance
API reference for Balance endpoints and webhooks
Verify real-time account balances. For how-to guidance, see the Balance documentation.
Endpoints
/accounts/balance/get
Fetch real-time account balances
Endpoints
/accounts/balance/get
Retrieve real-time balance data
The /accounts/balance/get endpoint returns the real-time balance for each of an Item's accounts. While other endpoints, such as /accounts/get, return a balance object, only /accounts/balance/get forces the available and current balance fields to be refreshed rather than cached. This endpoint can be used for existing Items that were added via any of Plaid’s other products. This endpoint can be used as long as Link has been initialized with any other product, balance itself is not a product that can be used to initialize Link. As this endpoint triggers a synchronous request for fresh data, latency may be higher than for other Plaid endpoints (typically less than 10 seconds, but occasionally up to 30 seconds or more); if you encounter errors, you may find it necessary to adjust your timeout period when making requests.
Request fields and example
Collapse all
access_token
requiredstring
The access token associated with the Item data is being requested for.
secret
string
Your Plaid API secret. The secret is required and may be provided either in the PLAID-SECRET header or as part of a request body.
client_id
string
Your Plaid API client_id. The client_id is required and may be provided either in the PLAID-CLIENT-ID header or as part of a request body.
options
object
Optional parameters to /accounts/balance/get.
Hide object
account_ids
[string]
A list of account_ids to retrieve for the Item. The default value is null.
Note: An error will be returned if a provided account_id is not associated with the Item.
min_last_updated_datetime
string
Timestamp in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) indicating the oldest acceptable balance when making a request to /accounts/balance/get.
This field is only necessary when the institution is ins_128026 (Capital One), and one or more account types being requested is a non-depository account (such as a credit card) as Capital One does not provide real-time balance for non-depository accounts. In this case, a value must be provided or an INVALID_REQUEST error with the code of INVALID_FIELD will be returned. For all other institutions, as well as for depository accounts at Capital One (including all checking and savings accounts) this field is ignored and real-time balance information will be fetched.
If this field is not ignored, and no acceptable balance is available, an INVALID_RESULT error with the code LAST_UPDATED_DATETIME_OUT_OF_RANGE will be returned.


Format: date-time 
Select group for content switcher
Current librariesLegacy libraries
// Pull real-time balance information for each account associated
// with the Item
const request: AccountsGetRequest = {
  access_token: accessToken,
};
try {
  const response = await plaidClient.accountsBalanceGet(request);
  const accounts = response.data.accounts;
} catch (error) {
  // handle error
}
Response fields and example
Collapse all
accounts
[object]
An array of financial institution accounts associated with the Item.
If /accounts/balance/get was called, each account will include real-time balance information.
Hide object
account_id
string
Plaid’s unique identifier for the account. This value will not change unless Plaid can't reconcile the account with the data returned by the financial institution. This may occur, for example, when the name of the account changes. If this happens a new account_id will be assigned to the account.
The account_id can also change if the access_token is deleted and the same credentials that were used to generate that access_token are used to generate a new access_token on a later date. In that case, the new account_id will be different from the old account_id.
If an account with a specific account_id disappears instead of changing, the account is likely closed. Closed accounts are not returned by the Plaid API.
When using a CRA endpoint (an endpoint associated with Plaid Check Consumer Report, i.e. any endpoint beginning with /cra/), the account_id returned will not match the account_id returned by a non-CRA endpoint.
Like all Plaid identifiers, the account_id is case sensitive.
balances
object
A set of fields describing the balance for an account. Balance information may be cached unless the balance object was returned by /accounts/balance/get.
Hide object
available
nullablenumber
The amount of funds available to be withdrawn from the account, as determined by the financial institution.
For credit-type accounts, the available balance typically equals the limit less the current balance, less any pending outflows plus any pending inflows.
For depository-type accounts, the available balance typically equals the current balance less any pending outflows plus any pending inflows. For depository-type accounts, the available balance does not include the overdraft limit.
For investment-type accounts (or brokerage-type accounts for API versions 2018-05-22 and earlier), the available balance is the total cash available to withdraw as presented by the institution.
Note that not all institutions calculate the available  balance. In the event that available balance is unavailable, Plaid will return an available balance value of null.
Available balance may be cached and is not guaranteed to be up-to-date in realtime unless the value was returned by /accounts/balance/get.
If current is null this field is guaranteed not to be null.


Format: double 
current
nullablenumber
The total amount of funds in or owed by the account.
For credit-type accounts, a positive balance indicates the amount owed; a negative amount indicates the lender owing the account holder.
For loan-type accounts, the current balance is the principal remaining on the loan, except in the case of student loan accounts at Sallie Mae (ins_116944). For Sallie Mae student loans, the account's balance includes both principal and any outstanding interest. Similar to credit-type accounts, a positive balance is typically expected, while a negative amount indicates the lender owing the account holder.
For investment-type accounts (or brokerage-type accounts for API versions 2018-05-22 and earlier), the current balance is the total value of assets as presented by the institution.
Note that balance information may be cached unless the value was returned by /accounts/balance/get; if the Item is enabled for Transactions, the balance will be at least as recent as the most recent Transaction update. If you require realtime balance information, use the available balance as provided by /accounts/balance/get.
When returned by /accounts/balance/get, this field may be null. When this happens, available is guaranteed not to be null.


Format: double 
limit
nullablenumber
For credit-type accounts, this represents the credit limit.
For depository-type accounts, this represents the pre-arranged overdraft limit, which is common for current (checking) accounts in Europe.
In North America, this field is typically only available for credit-type accounts.


Format: double 
iso_currency_code
nullablestring
The ISO-4217 currency code of the balance. Always null if unofficial_currency_code is non-null.
unofficial_currency_code
nullablestring
The unofficial currency code associated with the balance. Always null if iso_currency_code is non-null. Unofficial currency codes are used for currencies that do not have official ISO currency codes, such as cryptocurrencies and the currencies of certain countries.
See the currency code schema for a full listing of supported unofficial_currency_codes.
last_updated_datetime
nullablestring
Timestamp in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ) indicating the last time the balance was updated.
This field is returned only when the institution is ins_128026 (Capital One).


Format: date-time 
mask
nullablestring
The last 2-4 alphanumeric characters of either the account’s displayed mask or the account’s official account number. Note that the mask may be non-unique between an Item’s accounts.
name
string
The name of the account, either assigned by the user or by the financial institution itself
official_name
nullablestring
The official name of the account as given by the financial institution
type
string
investment: Investment account. In API versions 2018-05-22 and earlier, this type is called brokerage instead.
credit: Credit card
depository: Depository account
loan: Loan account
other: Non-specified account type
See the Account type schema for a full listing of account types and corresponding subtypes.


Possible values: investment, credit, depository, loan, brokerage, other
subtype
nullablestring
See the Account type schema for a full listing of account types and corresponding subtypes.


Possible values: 401a, 401k, 403B, 457b, 529, auto, brokerage, business, cash isa, cash management, cd, checking, commercial, construction, consumer, credit card, crypto exchange, ebt, education savings account, fixed annuity, gic, health reimbursement arrangement, home equity, hsa, isa, ira, keogh, lif, life insurance, line of credit, lira, loan, lrif, lrsp, money market, mortgage, mutual fund, non-custodial wallet, non-taxable brokerage account, other, other insurance, other annuity, overdraft, paypal, payroll, pension, prepaid, prif, profit sharing plan, rdsp, resp, retirement, rlif, roth, roth 401k, rrif, rrsp, sarsep, savings, sep ira, simple ira, sipp, stock plan, student, thrift savings plan, tfsa, trust, ugma, utma, variable annuity
verification_status
string
The current verification status of an Auth Item initiated through micro-deposits or database verification. Returned for Auth Items only.
pending_automatic_verification: The Item is pending automatic verification
pending_manual_verification: The Item is pending manual micro-deposit verification. Items remain in this state until the user successfully verifies the micro-deposit.
automatically_verified: The Item has successfully been automatically verified	
manually_verified: The Item has successfully been manually verified
verification_expired: Plaid was unable to automatically verify the deposit within 7 calendar days and will no longer attempt to validate the Item. Users may retry by submitting their information again through Link.
verification_failed: The Item failed manual micro-deposit verification because the user exhausted all 3 verification attempts. Users may retry by submitting their information again through Link. 
 unsent: The Item is pending micro-deposit verification, but Plaid has not yet sent the micro-deposit.
database_matched: The Item has successfully been verified using Plaid's data sources. Only returned for Auth Items created via Database Match.
database_insights_pass: The Item's numbers have been verified using Plaid's data sources: the routing and account number match a routing and account number of an account recognized on the Plaid network, and the account is not known by Plaid to be frozen or closed. Only returned for Auth Items created via Database Auth.
database_insights_pass_with_caution:The Item's numbers have been verified using Plaid's data sources and have some signal for being valid: the routing and account number were not recognized on the Plaid network, but the routing number is valid and the account number is a potential valid account number for that routing number. Only returned for Auth Items created via Database Auth.
database_insights_fail: The Item's numbers have been verified using Plaid's data sources and have signal for being invalid and/or have no signal for being valid. Typically this indicates that the routing number is invalid, the account number does not match the account number format associated with the routing number, or the account has been reported as closed or frozen. Only returned for Auth Items created via Database Auth.


Possible values: automatically_verified, pending_automatic_verification, pending_manual_verification, unsent, manually_verified, verification_expired, verification_failed, database_matched, database_insights_pass, database_insights_pass_with_caution, database_insights_fail
verification_name
string
The account holder name that was used for micro-deposit and/or database verification. Only returned for Auth Items created via micro-deposit or database verification. This name was manually-entered by the user during Link, unless it was otherwise provided via the user.legal_name request field in /link/token/create for the Link session that created the Item.
verification_insights
object
Insights from performing database verification for the account. Only returned for Auth Items using Database Auth.
Hide object
name_match_score
nullableinteger
Indicates the score of the name match between the given name provided during database verification (available in the verification_name field) and matched Plaid network accounts. If defined, will be a value between 0 and 100. Will be undefined if name matching was not enabled for the database verification session or if there were no eligible Plaid network matches to compare the given name with.
network_status
object
Status information about the account and routing number in the Plaid network.
Hide object
has_numbers_match
boolean
Indicates whether we found at least one matching account for the ACH account and routing number.
is_numbers_match_verified
boolean
Indicates if at least one matching account for the ACH account and routing number is already verified.
previous_returns
object
Information about known ACH returns for the account and routing number.
Hide object
has_previous_administrative_return
boolean
Indicates whether Plaid's data sources include a known administrative ACH return for account and routing number.
account_number_format
string
Indicator of account number format validity for institution.
valid: indicates that the account number has a correct format for the institution.
invalid: indicates that the account number has an incorrect format for the institution.
unknown: indicates that there was not enough information to determine whether the format is correct for the institution.


Possible values: valid, invalid, unknown
persistent_account_id
string
A unique and persistent identifier for accounts that can be used to trace multiple instances of the same account across different Items for depository accounts. This field is currently supported only for Items at institutions that use Tokenized Account Numbers (i.e., Chase and PNC, and in May 2025 US Bank). Because these accounts have a different account number each time they are linked, this field may be used instead of the account number to uniquely identify an account across multiple Items for payments use cases, helping to reduce duplicate Items or attempted fraud. In Sandbox, this field is populated for TAN-based institutions (ins_56, ins_13) as well as the OAuth Sandbox institution (ins_127287); in Production, it will only be populated for accounts at applicable institutions.
holder_category
nullablestring
Indicates the account's categorization as either a personal or a business account. This field is currently in beta; to request access, contact your account manager.


Possible values: business, personal, unrecognized
item
object
Metadata about the Item.
Hide object
item_id
string
The Plaid Item ID. The item_id is always unique; linking the same account at the same institution twice will result in two Items with different item_id values. Like all Plaid identifiers, the item_id is case-sensitive.
institution_id
nullablestring
The Plaid Institution ID associated with the Item. Field is null for Items created without an institution connection, such as Items created via Same Day Micro-deposits.
institution_name
nullablestring
The name of the institution associated with the Item. Field is null for Items created without an institution connection, such as Items created via Same Day Micro-deposits.
webhook
nullablestring
The URL registered to receive webhooks for the Item.
auth_method
nullablestring
The method used to populate Auth data for the Item. This field is only populated for Items that have had Auth numbers data set on at least one of its accounts, and will be null otherwise. For info about the various flows, see our Auth coverage documentation.
INSTANT_AUTH: The Item's Auth data was provided directly by the user's institution connection.
INSTANT_MATCH: The Item's Auth data was provided via the Instant Match fallback flow.
AUTOMATED_MICRODEPOSITS: The Item's Auth data was provided via the Automated Micro-deposits flow.
SAME_DAY_MICRODEPOSITS: The Item's Auth data was provided via the Same Day Micro-deposits flow.
INSTANT_MICRODEPOSITS: The Item's Auth data was provided via the Instant Micro-deposits flow.
DATABASE_MATCH: The Item's Auth data was provided via the Database Match flow.
DATABASE_INSIGHTS: The Item's Auth data was provided via the Database Insights flow.
TRANSFER_MIGRATED: The Item's Auth data was provided via /transfer/migrate_account.
INVESTMENTS_FALLBACK: The Item's Auth data for Investments Move was provided via a fallback flow.


Possible values: INSTANT_AUTH, INSTANT_MATCH, AUTOMATED_MICRODEPOSITS, SAME_DAY_MICRODEPOSITS, INSTANT_MICRODEPOSITS, DATABASE_MATCH, DATABASE_INSIGHTS, TRANSFER_MIGRATED, INVESTMENTS_FALLBACK, null
error
nullableobject
Errors are identified by error_code and categorized by error_type. Use these in preference to HTTP status codes to identify and handle specific errors. HTTP status codes are set and provide the broadest categorization of errors: 4xx codes are for developer- or user-related errors, and 5xx codes are for Plaid-related errors, and the status will be 2xx in non-error cases. An Item with a non-null error object will only be part of an API response when calling /item/get to view Item status. Otherwise, error fields will be null if no error has occurred; if an error has occurred, an error code will be returned instead.
Hide object
error_type
string
A broad categorization of the error. Safe for programmatic use.


Possible values: INVALID_REQUEST, INVALID_RESULT, INVALID_INPUT, INSTITUTION_ERROR, RATE_LIMIT_EXCEEDED, API_ERROR, ITEM_ERROR, ASSET_REPORT_ERROR, RECAPTCHA_ERROR, OAUTH_ERROR, PAYMENT_ERROR, BANK_TRANSFER_ERROR, INCOME_VERIFICATION_ERROR, MICRODEPOSITS_ERROR, SANDBOX_ERROR, PARTNER_ERROR, TRANSACTIONS_ERROR, TRANSACTION_ERROR, TRANSFER_ERROR, CHECK_REPORT_ERROR, CONSUMER_REPORT_ERROR
error_code
string
The particular error code. Safe for programmatic use.
error_code_reason
nullablestring
The specific reason for the error code. Currently, reasons are only supported OAuth-based item errors; null will be returned otherwise. Safe for programmatic use.
Possible values:
OAUTH_INVALID_TOKEN: The user’s OAuth connection to this institution has been invalidated.
OAUTH_CONSENT_EXPIRED: The user's access consent for this OAuth connection to this institution has expired.
OAUTH_USER_REVOKED: The user’s OAuth connection to this institution is invalid because the user revoked their connection.
error_message
string
A developer-friendly representation of the error code. This may change over time and is not safe for programmatic use.
display_message
nullablestring
A user-friendly representation of the error code. null if the error is not related to user action.
This may change over time and is not safe for programmatic use.
request_id
string
A unique ID identifying the request, to be used for troubleshooting purposes. This field will be omitted in errors provided by webhooks.
causes
array
In this product, a request can pertain to more than one Item. If an error is returned for such a request, causes will return an array of errors containing a breakdown of these errors on the individual Item level, if any can be identified.
causes will be provided for the error_type ASSET_REPORT_ERROR or CHECK_REPORT_ERROR. causes will also not be populated inside an error nested within a warning object.
status
nullableinteger
The HTTP status code associated with the error. This will only be returned in the response body when the error information is provided via a webhook.
documentation_url
string
The URL of a Plaid documentation page with more information about the error
suggested_action
nullablestring
Suggested steps for resolving the error
available_products
[string]
A list of products available for the Item that have not yet been accessed. The contents of this array will be mutually exclusive with billed_products.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, payment_initiation, identity_verification, transactions, credit_details, income, income_verification, standing_orders, transfer, employment, recurring_transactions, transactions_refresh, signal, statements, processor_payments, processor_identity, profile, cra_base_report, cra_income_insights, cra_partner_insights, cra_network_insights, cra_cashflow_insights, cra_monitoring, layer, pay_by_bank, protect_linked_bank
billed_products
[string]
A list of products that have been billed for the Item. The contents of this array will be mutually exclusive with available_products. Note - billed_products is populated in all environments but only requests in Production are billed. Also note that products that are billed on a pay-per-call basis rather than a pay-per-Item basis, such as balance, will not appear here.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, payment_initiation, identity_verification, transactions, credit_details, income, income_verification, standing_orders, transfer, employment, recurring_transactions, transactions_refresh, signal, statements, processor_payments, processor_identity, profile, cra_base_report, cra_income_insights, cra_partner_insights, cra_network_insights, cra_cashflow_insights, cra_monitoring, layer, pay_by_bank, protect_linked_bank
products
[string]
A list of products added to the Item. In almost all cases, this will be the same as the billed_products field. For some products, it is possible for the product to be added to an Item but not yet billed (e.g. Assets, before /asset_report/create has been called, or Auth or Identity when added as Optional Products but before their endpoints have been called), in which case the product may appear in products but not in billed_products.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, payment_initiation, identity_verification, transactions, credit_details, income, income_verification, standing_orders, transfer, employment, recurring_transactions, transactions_refresh, signal, statements, processor_payments, processor_identity, profile, cra_base_report, cra_income_insights, cra_partner_insights, cra_network_insights, cra_cashflow_insights, cra_monitoring, layer, pay_by_bank, protect_linked_bank
consented_products
[string]
A list of products that the user has consented to for the Item via Data Transparency Messaging. This will consist of all products where both of the following are true: the user has consented to the required data scopes for that product and you have Production access for that product.


Possible values: assets, auth, balance, balance_plus, beacon, identity, identity_match, investments, investments_auth, liabilities, transactions, income, income_verification, transfer, employment, recurring_transactions, signal, statements, processor_payments, processor_identity, cra_base_report, cra_income_insights, cra_partner_insights, cra_cashflow_insights, cra_monitoring, layer
consent_expiration_time
nullablestring
The date and time at which the Item's access consent will expire, in ISO 8601 format. If the Item does not have consent expiration scheduled, this field will be null. Currently, only institutions in Europe and a small number of institutions in the US have expiring consent. For a list of US institutions that currently expire consent, see the OAuth Guide. Closer to the 1033 compliance deadline of April 1, 2026, expiration times will be populated more widely. For more details on 1033-related consent expiration that may be enforced in the future, see Data Transparency Messaging consent expiration.


Format: date-time 
update_type
string
Indicates whether an Item requires user interaction to be updated, which can be the case for Items with some forms of two-factor authentication.
background - Item can be updated in the background
user_present_required - Item requires user interaction to be updated


Possible values: background, user_present_required
request_id
string
A unique identifier for the request, which can be used for troubleshooting. This identifier, like all Plaid identifiers, is case sensitive.
// Pull real-time balance information for each account associated
// with the Item
const request: AccountsGetRequest = {
  access_token: accessToken,
};
try {
  const response = await plaidClient.accountsBalanceGet(request);
  const accounts = response.data.accounts;
} catch (error) {
  // handle error
}

{
  "accounts": [
    {
      "account_id": "BxBXxLj1m4HMXBm9WZZmCWVbPjX16EHwv99vp",
      "balances": {
        "available": 100,
        "current": 110,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "holder_category": "personal",
      "mask": "0000",
      "name": "Plaid Checking",
      "official_name": "Plaid Gold Standard 0% Interest Checking",
      "subtype": "checking",
      "type": "depository"
    },
    {
      "account_id": "dVzbVMLjrxTnLjX4G66XUp5GLklm4oiZy88yK",
      "balances": {
        "available": null,
        "current": 410,
        "iso_currency_code": "USD",
        "limit": 2000,
        "unofficial_currency_code": null
      },
      "mask": "3333",
      "name": "Plaid Credit Card",
      "official_name": "Plaid Diamond 12.5% APR Interest Credit Card",
      "subtype": "credit card",
      "type": "credit"
    },
    {
      "account_id": "Pp1Vpkl9w8sajvK6oEEKtr7vZxBnGpf7LxxLE",
      "balances": {
        "available": null,
        "current": 65262,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "mask": "7777",
      "name": "Plaid Student Loan",
      "official_name": null,
      "subtype": "student",
      "type": "loan"
    }
  ],
  "item": {
    "available_products": [
      "balance",
      "identity",
      "investments"
    ],
    "billed_products": [
      "assets",
      "auth",
      "liabilities",
      "transactions"
    ],
    "consent_expiration_time": null,
    "error": null,
    "institution_id": "ins_3",
    "institution_name": "Chase",
    "item_id": "eVBnVMp7zdTJLkRNr33Rs6zr7KNJqBFL9DrE6",
    "update_type": "background",
    "webhook": "https://www.genericwebhookurl.com/webhook",
    "auth_method": "INSTANT_AUTH"
  },
  "request_id": "qk5Bxes3gDfv4F2"
}


