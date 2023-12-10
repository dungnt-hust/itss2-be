
export enum ErrorCode {
    NO_ERROR,
    UNKNOWN_ERROR,
    PERMISSION_DENIED,
    CONFIG_INVALID,
    PARAMS_INVALID,
    TOKEN_IS_INVALID,
    CAPTCHA_IS_INVALID,
    DUPLICATE_LOGIN,
    HEALTH_CHECK_ERROR,
    UPDATE_ZERO_FIELD,
    REQUEST_TIMEOUT,
    TOO_MANY_REQUEST,
    OTP_INVALID_OR_EXPIRED,
    FILE_NOT_FOUND,
    TEST_NET_DAY_ERROR = 14,

    // User
    USER_INVALID = 1000,
    USERNAME_EXISTS,
    ADDRESS_EXISTS,
    USERNAME_INVALID,
    USER_EMAIL_VERIFIED,
    EMAIL_EXISTS,
    MOBILE_EXISTS,
    REFERRAL_USER_NOT_EXISTS,
    USER_NOT_ACTIVE_YET,
    PASSWORD_IS_INVALID,
    OLD_PASSWORD_IS_INVALID,
    USER_ACTIVATED,
    USER_NOT_FOUND,
    USER_EXISTS,
    NONCE_INVALID,
    ADDRESS_INVALID,
    USER_BANNED,
    PASSWORD_NOT_CREATED,

    // NFT ITEM
    ID_NOT_EXISTS= 2000,
    NFT_ITEM_NOT_EXISTS,
    TRANSACTION_ID_NOT_EXIST,
    NFT_NOT_EXISTS,
    NFT_ADDRESS_NOT_ERC721_TOKEN,

    // blockchain
    BLOCKCHAIN_SYMBOL_INVALID = 3001,

    // collection
    COLLECTION_INVALID = 4001,
    USER_NOT_ACTIVE,



}

export enum HttpStatus {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    PAYMENT_REQUIRE = 402,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    REQUEST_TIMEOUT = 408,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUEST = 429,
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    SERVICE_UNAVAILABLE = 503,
}

export enum BalanceHistoryType {
    DEPOSIT = 1,
    WITHDRAWAL,
    ORDER_PLACED,
    ORDER_FILLED,
    TRADE_COMMISSION,
    TAX_COMMISSION,
    LOAN_COMMISSION,
    LOSS_CUT_COMMISSION,
    SWAP_COMMISSION,
    ORDER_CANCELED,
    WITHDRAWAL_REJECT,
}
export enum ConfigType {
    COMMON = 1,
    DASH_BOARD = 2
}

export enum TokenEventType {
    CREATE = 1,
    TRANSFER,
    SET_PRICE,
    BID,
    CANCEL_BID,
    ACCEPT_BID,
    SOLD
}

export enum ActiveStatus {
    ACTIVATED = 1,
    UNACTIVATED = 2,
}
export enum TokenType {
    LOGIN = 1,
    ACTIVE_USER ,
    RESET_PASSWORD ,
}

export enum OtpType {
    VERIFY_EMAIL = 1,
}

export enum OtpWay {
    EMAIL = 1,
    // MOBILE,
}

export enum Gender {
    MALE = 1,
    FEMALE,
}

export enum ERCTokenType {
    ERC20 = 1,
    NFT_ITEM ,
    NFT_BOX ,
}
export enum BuyBoxStatus {
    PENDING = 1,
    PROCESSING ,
    DONE ,
    ERROR ,
}

export enum UserStatus {
    ACTIVATED = 1,
    DEACTIVATED = 2,
    BANNED,
}

export enum EventWhiteListType {
    BUY_BOX = 1,
}

export enum CollectionType {
    ERC721 =1,
    ERC1155,
}
export enum IsVerified {
    NO,
    YES
}

export enum ConfigDashboard {
    LAUNCHPAD = 'launchpad',
    HOT_COLLECTION = 'hot_collection',
    HOT_AUCTIONS = 'hot_auctions'
}

export enum InventoryKind {
    SELL = 1,
    OFFER,
    AUCTION
}

export enum InventoryStatus {
    OPEN = 0,
    DONE,
    CANCEL
}
export enum LikeStatus {
    LIKE = 1,
    UNLIKE = 2,
}

