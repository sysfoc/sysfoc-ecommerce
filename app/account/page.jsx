"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseClient.js";
import { useAuth } from "../../lib/clientAuth.js";
import { useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  MapPin,
  Settings,
  Edit3,
  Bell,
  Mail,
  Phone,
  Plus,
  Trash2,
  Info,
} from "lucide-react";
import { Calendar, Clock, DollarSign, Check, X } from "lucide-react";
import {
  Avatar,
  Card,
  Button,
  Select,
  Badge,
  TextInput,
  Modal,
  Label,
  Checkbox,
} from "flowbite-react";

const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "INR", "AED"];
const LOCALES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "ur-PK", name: "Urdu (Pakistan)" },
  { code: "hi-IN", name: "Hindi (India)" },
  { code: "ar-AE", name: "Arabic (UAE)" },
];
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Kolkata",
];

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    email_notifications: true,
    marketing_opt_in: false,
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: "shipping",
    label: "",
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    is_default_shipping: false,
    is_default_billing: false,
  });

  // Form state for preferences
  const [preferences, setPreferences] = useState({
    preferred_currency: "USD",
    preferred_locale: "en-US",
    timezone: "UTC",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    } else if (user) {
      fetchUserProfile();
    }
  }, [user, loading, router]);

  const fetchUserProfile = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        console.log("Fetched profile:", profile);
        setUserProfile(profile);
        setProfileForm({
          name: profile.name || user?.displayName || "",
          phone: profile.phone || "",
          email_notifications: profile.email_notifications ?? true,
          marketing_opt_in: profile.marketing_opt_in ?? false, // Changed
        });
        setPreferences({
          preferred_currency: profile.preferred_currency || "USD",
          preferred_locale: profile.preferred_locale || "en-US",
          timezone: profile.timezone || "UTC",
        });
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/users/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          email_notifications: profileForm.email_notifications,
          marketing_opt_in: profileForm.marketing_opt_in,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setProfileForm({
          name: updatedProfile.name || user?.displayName || "",
          phone: updatedProfile.phone || "",
          email_notifications: updatedProfile.email_notifications ?? true,
          marketing_opt_in: updatedProfile.marketing_opt_in ?? false,
        });
        setEditingProfile(false);
        setSuccess("Profile updated successfully");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/users/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setSuccess("Preferences updated successfully");
      } else {
        throw new Error("Failed to update preferences");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      type: "shipping",
      label: "",
      full_name: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_default_shipping: false,
      is_default_billing: false,
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");

    try {
      const token = await user.getIdToken();

      if (addressForm.type === "billing" && !editingAddress) {
        const hasBillingAddress = userProfile?.addresses?.some(
          (addr) => addr.type === "billing"
        );

        if (hasBillingAddress) {
          setError(
            "You can only have one billing address. Please edit the existing one."
          );
          setUpdating(false);
          return;
        }
      }

      const url = editingAddress
        ? `/api/users/addresses/${editingAddress._id}`
        : "/api/users/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...addressForm,
          is_default_billing: addressForm.type === "billing",
        }),
      });

      if (response.ok) {
        await fetchUserProfile();
        setShowAddressModal(false);
        setSuccess(
          `Address ${editingAddress ? "updated" : "added"} successfully`
        );
      } else {
        throw new Error(
          `Failed to ${editingAddress ? "update" : "add"} address`
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setUpdating(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchUserProfile();
        setSuccess("Address deleted successfully");
      } else {
        throw new Error("Failed to delete address");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto mb-4"></div>
          <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
            Loading account...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {(error || success) && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            {error && (
              <div className="p-3 text-sm text-theme-error rounded-lg bg-red-50 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800 shadow-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 text-sm text-theme-success rounded-lg bg-green-50 border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800 shadow-lg">
                {success}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="flex flex-col items-center text-center mb-4">
                <Avatar
                  size="lg"
                  rounded
                  img={
                    user.photoURL ||
                    userProfile?.avatar_url ||
                    "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1906669723.jpg?auto=compress&cs=tinysrgb&w=600"
                  }
                />
                <h3 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mt-2">
                  {userProfile?.name || user?.displayName || "User"}
                </h3>
                <p className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {user?.email}
                </p>
                <Badge color="success" className="mt-1">
                  {user?.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg ${
                    activeTab === "profile"
                      ? "bg-blue-100 text-theme-primary dark:bg-blue-900 dark:text-blue-300"
                      : "text-theme-text-primary-light hover:bg-theme-hover-bg-light dark:text-theme-text-primary-dark dark:hover:bg-theme-hover-bg-dark"
                  }`}
                >
                  <User size={16} className="mr-2" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg ${
                    activeTab === "orders"
                      ? "bg-blue-100 text-theme-primary dark:bg-blue-900 dark:text-blue-300"
                      : "text-theme-text-primary-light hover:bg-theme-hover-bg-light dark:text-theme-text-primary-dark dark:hover:bg-theme-hover-bg-dark"
                  }`}
                >
                  <ShoppingBag size={16} className="mr-2" />
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg ${
                    activeTab === "addresses"
                      ? "bg-blue-100 text-theme-primary dark:bg-blue-900 dark:text-blue-300"
                      : "text-theme-text-primary-light hover:bg-theme-hover-bg-light dark:text-theme-text-primary-dark dark:hover:bg-theme-hover-bg-dark"
                  }`}
                >
                  <MapPin size={16} className="mr-2" />
                  Addresses
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg ${
                    activeTab === "preferences"
                      ? "bg-blue-100 text-theme-primary dark:bg-blue-900 dark:text-blue-300"
                      : "text-theme-text-primary-light hover:bg-theme-hover-bg-light dark:text-theme-text-primary-dark dark:hover:bg-theme-hover-bg-dark"
                  }`}
                >
                  <Settings size={16} className="mr-2" />
                  Preferences
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center">
                    <User size={18} className="mr-2" />
                    Profile
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => setEditingProfile(!editingProfile)}
                  >
                    <Edit3 size={14} className="mr-1" />
                    {editingProfile ? "Cancel" : "Edit"}
                  </Button>
                </div>

                {editingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <Label
                          htmlFor="name"
                          className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-1"
                        >
                          <User size={14} className="mr-1" />
                          Name
                        </Label>
                        <TextInput
                          id="name"
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              name: e.target.value,
                            })
                          }
                          placeholder="Full name"
                          required
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="phone"
                          className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-1"
                        >
                          <Phone size={14} className="mr-1" />
                          Phone
                        </Label>
                        <TextInput
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Phone number"
                          type="tel"
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2">
                        <Bell size={14} className="mr-1" />
                        Notifications
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Checkbox
                            id="email_notifications"
                            checked={profileForm.email_notifications}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                email_notifications: e.target.checked,
                              })
                            }
                          />
                          <Label
                            htmlFor="email_notifications"
                            className="ml-2 text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark"
                          >
                            Email alerts
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="marketing_opt_in"
                            checked={profileForm.marketing_opt_in} // Changed to marketing_opt_in
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                marketing_opt_in: e.target.checked,
                              })
                            }
                           />
                          <Label
                            htmlFor="marketing_opt_in"
                            className="ml-2 text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark"
                          >
                            {" "}
                            Marketing emails
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={updating} size="sm">
                      {updating ? "Saving..." : "Save"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                      <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2 uppercase tracking-wide">
                          <User size={14} className="mr-1.5" />
                          Full Name
                        </div>
                        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {userProfile?.name ||
                            user?.displayName ||
                            "Not provided"}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2 uppercase tracking-wide">
                          <Mail size={14} className="mr-1.5" />
                          Email Address
                        </div>
                        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {user?.email}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2 uppercase tracking-wide">
                          <Phone size={14} className="mr-1.5" />
                          Phone Number
                        </div>
                        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {userProfile?.phone || "Not provided"}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2 uppercase tracking-wide">
                          <ShoppingBag size={14} className="mr-1.5" />
                          Total Orders
                        </div>
                        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {userProfile?.order_count || 0} orders
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2 uppercase tracking-wide">
                          <DollarSign size={14} className="mr-1.5" />
                          Total Spent
                        </div>
                        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {userProfile?.preferred_currency || "USD"}{" "}
                          {userProfile?.total_spent || "0.00"}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2 uppercase tracking-wide">
                          <Bell size={14} className="mr-1.5" />
                          Email Notifications
                        </div>
                        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center">
                          {userProfile?.email_notifications ? (
                            <>
                              <Check
                                size={14}
                                className="text-green-500 mr-1.5"
                              />
                              <span className="text-green-600 dark:text-green-400">
                                Enabled
                              </span>
                            </>
                          ) : (
                            <>
                              <X size={14} className="text-red-500 mr-1.5" />
                              <span className="text-red-600 dark:text-red-400">
                                Disabled
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2 uppercase tracking-wide">
                          <Mail size={14} className="mr-1.5" />
                          Marketing Emails
                        </div>
                        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center">
                          {userProfile?.marketing_opt_in ? (
                            <>
                              <Check
                                size={14}
                                className="text-green-500 mr-1.5"
                              />
                              <span className="text-green-600 dark:text-green-400">
                                Enabled
                              </span>
                            </>
                          ) : (
                            <>
                              <X size={14} className="text-red-500 mr-1.5" />
                              <span className="text-red-600 dark:text-red-400">
                                Disabled
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2 uppercase tracking-wide">
                          <User size={14} className="mr-1.5" />
                          Account Status
                        </div>
                        <div className="flex items-center">
                          <Badge
                            color={user?.emailVerified ? "success" : "warning"}
                            className="text-xs font-medium"
                          >
                            {user?.emailVerified
                              ? "Verified"
                              : "Pending Verification"}
                          </Badge>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2 uppercase tracking-wide">
                          <Calendar size={14} className="mr-1.5" />
                          Member Since
                        </div>
                        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {userProfile?.created_at
                            ? new Date(
                                userProfile.created_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark flex items-center mb-2 uppercase tracking-wide">
                          <Clock size={14} className="mr-1.5" />
                          Last Login
                        </div>
                        <div className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {userProfile?.last_login_at
                            ? new Date(
                                userProfile.last_login_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <Card className="p-4 h-fit">
                <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
                  Order History
                </h2>
                <div className="text-center py-12">
                  <ShoppingBag
                    size={48}
                    className="mx-auto text-theme-text-muted-light dark:text-theme-text-muted-dark mb-3"
                  />
                  <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    No orders yet
                  </p>
                  <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                    Your order history will appear here
                  </p>
                </div>
              </Card>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <Card className="p-4 h-fit">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Saved Addresses
                  </h2>
                  <Button size="sm" onClick={handleAddAddress}>
                    <Plus size={16} className="mr-1" />
                    Add Address
                  </Button>
                </div>

                {userProfile?.addresses && userProfile.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {userProfile.addresses.map((address, index) => (
                      <div
                        key={address._id || index}
                        className="border rounded-lg p-3 border-theme-border-light dark:border-theme-border-dark"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center flex-wrap gap-1">
                            <Badge
                              color={
                                address.type === "shipping" ? "blue" : "purple"
                              }
                            >
                              {address.type === "shipping"
                                ? "Shipping"
                                : "Billing"}
                            </Badge>
                            <Badge color="gray">
                              {address.label || "Address"}
                            </Badge>
                            {address.is_default_shipping && (
                              <Badge color="green" size="sm">
                                Default Shipping
                              </Badge>
                            )}
                            {address.is_default_billing && (
                              <Badge color="purple" size="sm">
                                Default Billing
                              </Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-theme-primary hover:text-theme-primary-hover dark:text-theme-primary"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-theme-error hover:text-red-800 dark:text-theme-error"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm">
                          <p className="font-medium">{address.full_name}</p>
                          {address.phone && (
                            <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                              {address.phone}
                            </p>
                          )}
                          <p className="mt-1">
                            {address.line1}
                            {address.line2 && (
                              <>
                                <br />
                                {address.line2}
                              </>
                            )}
                            <br />
                            {address.city}, {address.state}{" "}
                            {address.postal_code}
                            <br />
                            {address.country}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin
                      size={48}
                      className="mx-auto text-theme-text-muted-light dark:text-theme-text-muted-dark mb-3"
                    />
                    <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                      No addresses saved
                    </p>
                    <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                      Add your shipping and billing addresses
                    </p>
                  </div>
                )}
              </Card>
            )}

            {activeTab === "preferences" && (
              <Card className="p-4 h-fit">
                <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
                  Account Preferences
                </h2>
                <form onSubmit={handleUpdatePreferences} className="space-y-3">
                  <div>
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1"
                    >
                      Preferred Currency
                    </label>
                    <Select
                      id="currency"
                      value={preferences.preferred_currency}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          preferred_currency: e.target.value,
                        })
                      }
                    >
                      {CURRENCIES.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor="locale"
                      className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1"
                    >
                      Preferred Language
                    </label>
                    <Select
                      id="locale"
                      value={preferences.preferred_locale}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          preferred_locale: e.target.value,
                        })
                      }
                    >
                      {LOCALES.map((locale) => (
                        <option key={locale.code} value={locale.code}>
                          {locale.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor="timezone"
                      className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1"
                    >
                      Timezone
                    </label>
                    <Select
                      id="timezone"
                      value={preferences.timezone}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          timezone: e.target.value,
                        })
                      }
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <Button type="submit" disabled={updating} className="mt-3">
                    {updating ? "Updating..." : "Update Preferences"}
                  </Button>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal show={showAddressModal} onClose={() => setShowAddressModal(false)}>
        <Modal.Header>
          {editingAddress ? "Edit Address" : "Add New Address"}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveAddress} className="space-y-4">
            {/* Address Type Selection */}
            <div>
              <Label htmlFor="addressType" value="Address Type" />
              <Select
                id="addressType"
                value={addressForm.type || "shipping"}
                onChange={(e) => {
                  const type = e.target.value;
                  setAddressForm({
                    ...addressForm,
                    type,
                    // Reset default flags when changing type
                    is_default_shipping:
                      type === "shipping" && addressForm.is_default_shipping,
                    is_default_billing: type === "billing",
                  });
                }}
                required
              >
                <option value="shipping">Shipping Address</option>
                <option value="billing">Billing Address</option>
              </Select>
            </div>

            {/* Show appropriate badge based on type */}
            {addressForm.type && (
              <Badge
                color={addressForm.type === "shipping" ? "blue" : "purple"}
              >
                {addressForm.type === "shipping"
                  ? "Shipping Address"
                  : "Billing Address"}
              </Badge>
            )}

            {/* Address Label */}
            <div>
              <Label htmlFor="label" value="Address Label (e.g., Home, Work)" />
              <TextInput
                id="label"
                value={addressForm.label}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, label: e.target.value })
                }
                placeholder="Home, Office, etc."
              />
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="full_name" value="Full Name" />
              <TextInput
                id="full_name"
                value={addressForm.full_name}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, full_name: e.target.value })
                }
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone" value="Phone Number" />
              <TextInput
                id="phone"
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, phone: e.target.value })
                }
                placeholder="Enter phone number"
                type="tel"
              />
            </div>

            {/* Street Address Line 1 */}
            <div>
              <Label htmlFor="line1" value="Street Address" />
              <TextInput
                id="line1"
                value={addressForm.line1}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, line1: e.target.value })
                }
                placeholder="Enter street address"
                required
              />
            </div>

            {/* Street Address Line 2 */}
            <div>
              <Label
                htmlFor="line2"
                value="Apartment, Suite, etc. (Optional)"
              />
              <TextInput
                id="line2"
                value={addressForm.line2}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, line2: e.target.value })
                }
                placeholder="Apartment, suite, unit, etc."
              />
            </div>

            {/* City, State, and Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" value="City" />
                <TextInput
                  id="city"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, city: e.target.value })
                  }
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state" value="State/Province" />
                <TextInput
                  id="state"
                  value={addressForm.state}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, state: e.target.value })
                  }
                  placeholder="State/Province"
                  required
                />
              </div>
              <div>
                <Label htmlFor="postal_code" value="Postal Code" />
                <TextInput
                  id="postal_code"
                  value={addressForm.postal_code}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      postal_code: e.target.value,
                    })
                  }
                  placeholder="Postal Code"
                  required
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <Label htmlFor="country" value="Country" />
              <TextInput
                id="country"
                value={addressForm.country}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, country: e.target.value })
                }
                placeholder="Country"
                required
              />
            </div>

            {/* Conditional fields based on address type */}
            {addressForm.type === "shipping" && (
              <div className="flex items-center">
                <Checkbox
                  id="is_default_shipping"
                  checked={addressForm.is_default_shipping}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      is_default_shipping: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="is_default_shipping" className="ml-2">
                  Set as default shipping address
                </Label>
              </div>
            )}

            {addressForm.type === "billing" && (
              <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <Info size={16} className="mr-2" />
                You can only have one billing address, which will be set as
                default.
              </div>
            )}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSaveAddress} disabled={updating}>
            {updating ? "Saving..." : "Save Address"}
          </Button>
          <Button color="gray" onClick={() => setShowAddressModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
