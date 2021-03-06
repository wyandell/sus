"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseFailReasons = void 0;
var PurchaseFailReasons;
(function (PurchaseFailReasons) {
    PurchaseFailReasons[PurchaseFailReasons["Success"] = 0] = "Success";
    PurchaseFailReasons[PurchaseFailReasons["AlreadyOwned"] = 1] = "AlreadyOwned";
    PurchaseFailReasons[PurchaseFailReasons["ApplicationError"] = 2] = "ApplicationError";
    PurchaseFailReasons[PurchaseFailReasons["EconomyDisabled"] = 3] = "EconomyDisabled";
    PurchaseFailReasons[PurchaseFailReasons["InsufficientFunds"] = 4] = "InsufficientFunds";
    PurchaseFailReasons[PurchaseFailReasons["InsufficientMembership"] = 5] = "InsufficientMembership";
    PurchaseFailReasons[PurchaseFailReasons["InvalidTransaction"] = 6] = "InvalidTransaction";
    PurchaseFailReasons[PurchaseFailReasons["NotAvailableInRobux"] = 7] = "NotAvailableInRobux";
    PurchaseFailReasons[PurchaseFailReasons["NotForSale"] = 8] = "NotForSale";
    PurchaseFailReasons[PurchaseFailReasons["PriceChanged"] = 9] = "PriceChanged";
    PurchaseFailReasons[PurchaseFailReasons["SaleExpired"] = 10] = "SaleExpired";
    PurchaseFailReasons[PurchaseFailReasons["SupplyExausted"] = 11] = "SupplyExausted";
    PurchaseFailReasons[PurchaseFailReasons["ContentRatingRestricted"] = 12] = "ContentRatingRestricted";
    PurchaseFailReasons[PurchaseFailReasons["UnknownBirthday"] = 13] = "UnknownBirthday";
    PurchaseFailReasons[PurchaseFailReasons["AffiliateSalesDisabled"] = 14] = "AffiliateSalesDisabled";
    PurchaseFailReasons[PurchaseFailReasons["BadAffiliateSaleProduct"] = 15] = "BadAffiliateSaleProduct";
    PurchaseFailReasons[PurchaseFailReasons["ExceptionOccurred"] = 16] = "ExceptionOccurred";
    PurchaseFailReasons[PurchaseFailReasons["IOSOnlyItem"] = 17] = "IOSOnlyItem";
    PurchaseFailReasons[PurchaseFailReasons["InvalidArguments"] = 18] = "InvalidArguments";
    PurchaseFailReasons[PurchaseFailReasons["TooManyPurchases"] = 19] = "TooManyPurchases";
    PurchaseFailReasons[PurchaseFailReasons["Unauthorized"] = 20] = "Unauthorized";
    PurchaseFailReasons[PurchaseFailReasons["AccountRestrictionsRestricted"] = 21] = "AccountRestrictionsRestricted";
    PurchaseFailReasons[PurchaseFailReasons["PendingTransactionAlreadyExists"] = 22] = "PendingTransactionAlreadyExists";
})(PurchaseFailReasons = exports.PurchaseFailReasons || (exports.PurchaseFailReasons = {}));
//# sourceMappingURL=Economy.js.map