import mongoose from "mongoose"

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String }, // e.g., "Home"
    full_name: { type: String },
    phone: { type: String },
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postal_code: { type: String },
    country: { type: String }, // ISO 3166-1 alpha-2, e.g., "US", "PK"
    is_default_shipping: { type: Boolean, default: false },
    is_default_billing: { type: Boolean, default: false },
  },
  { _id: true },
)

const LoginEventSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    ip: { type: String },
    method: { type: String, enum: ["google", "password"] },
  },
  { _id: false },
)

const CartItemSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
    added_at: { type: Date, default: Date.now },
  },
  { _id: false },
)

const UserSchema = new mongoose.Schema(
  {
    // Identity
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true, index: true },
    email_verified: { type: Boolean, default: false },
    name: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    avatar_url: { type: String },

    // Auth meta
    signup_method: { type: String, enum: ["google", "password"], required: true },
    provider_ids: [{ type: String }], // e.g., ['google.com', 'password']

    // Status
    role: { type: String, enum: ["user", "admin"], default: "user" },
    is_active: { type: Boolean, default: true },
    is_banned: { type: Boolean, default: false },

    // Preferences
    preferred_currency: { type: String, default: "USD" }, // ISO 4217
    preferred_locale: { type: String, default: "en-US" },
    timezone: { type: String, default: "UTC" },
    marketing_opt_in: { type: Boolean, default: false },

    // Shopping & Orders
    cart: [CartItemSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId }], // Product IDs
    order_count: { type: Number, default: 0 },
    total_spent: { type: Number, default: 0 }, // In preferred currency

    // Customer Preferences
    email_notifications: { type: Boolean, default: true },
    sms_notifications: { type: Boolean, default: false },

    // Customer Status
    customer_since: { type: Date, default: Date.now },
    last_order_at: { type: Date },

    // Addresses
    addresses: [AddressSchema],

    // Defaults
    default_shipping_address_id: { type: mongoose.Schema.Types.ObjectId },
    default_billing_address_id: { type: mongoose.Schema.Types.ObjectId },

    // IP & audit
    signup_ip: { type: String },
    last_login_ip: { type: String },
    last_login_at: { type: Date },
    login_history: [LoginEventSchema],

    // System
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
)

export default mongoose.models.User || mongoose.model("User", UserSchema)
