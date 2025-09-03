"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseClient.js";
import { useAuth } from "../../lib/clientAuth.js";
import { useRouter } from "next/navigation";
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
import {
  FaUser,
  FaCog,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaPhone,
  FaBell,
  FaEnvelope,
} from "react-icons/fa";

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
    marketing_communications: false,
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
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
          marketing_communications: profile.marketing_opt_in ?? false,
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
          marketing_communications: profileForm.marketing_communications,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        setProfileForm({
          name: updatedProfile.name || user?.displayName || "",
          phone: updatedProfile.phone || "",
          email_notifications: updatedProfile.email_notifications ?? true,
          marketing_communications: updatedProfile.marketing_opt_in ?? false,
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
        body: JSON.stringify(addressForm),
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
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-theme-bg-light dark:bg-theme-bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {(error || success) && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            {error && (
              <div className="mb-4 p-4 text-sm text-theme-error rounded-lg bg-red-50 border border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800 shadow-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 text-sm text-theme-success rounded-lg bg-green-50 border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800 shadow-lg">
                {success}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="relative mb-3">
                  <Avatar
                    size="lg"
                    rounded
                    img={
                      user.photoURL ||
                      userProfile?.avatar_url ||
                      "https://images.pexels.com/photos/9604304/pexels-photo-9604304.jpeg?auto=compress&cs=tinysrgb&w=600"
                    }
                  />
                </div>
                <h3 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {userProfile?.name || user?.displayName || "User"}
                </h3>
                <p className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {user?.email}
                </p>
                <Badge color="success" className="mt-2">
                  {user?.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg ${
                    activeTab === "profile"
                      ? "bg-blue-100 text-theme-primary dark:bg-blue-900 dark:text-blue-300"
                      : "text-theme-text-primary-light hover:bg-theme-hover-bg-light dark:text-theme-text-primary-dark dark:hover:bg-theme-hover-bg-dark"
                  }`}
                >
                  <FaUser className="mr-3" />
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
                  <FaShoppingBag className="mr-3" />
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
                  <FaMapMarkerAlt className="mr-3" />
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
                  <FaCog className="mr-3" />
                  Preferences
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Profile Information
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => setEditingProfile(!editingProfile)}
                  >
                    <FaEdit className="mr-2" />
                    {editingProfile ? "Cancel" : "Edit"}
                  </Button>
                </div>

                {editingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Basic Information Section */}
                    <div>
                      <h3 className="text-lg font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="name"
                            className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-medium"
                          >
                            Full Name
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
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="phone"
                            className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-medium"
                          >
                            Phone Number
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
                            placeholder="Enter your phone number"
                            type="tel"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4 flex items-center">
                        <FaBell className="mr-2" />
                        Notification Preferences
                      </h3>
                      <div className="space-y-4">
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
                            className="ml-2 text-theme-text-primary-light dark:text-theme-text-primary-dark"
                          >
                            <div className="flex items-center">
                              <FaEnvelope className="mr-2 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
                              Email Notifications
                            </div>
                            <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                              Receive order updates, account security alerts,
                              and important notifications
                            </p>
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id="marketing_communications"
                            checked={profileForm.marketing_communications}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                marketing_communications: e.target.checked,
                              })
                            }
                          />
                          <Label
                            htmlFor="marketing_communications"
                            className="ml-2 text-theme-text-primary-light dark:text-theme-text-primary-dark"
                          >
                            <div className="flex items-center">
                              <FaEnvelope className="mr-2 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
                              Marketing Communications
                            </div>
                            <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                              Receive promotional emails, special offers, and
                              product updates
                            </p>
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={updating}>
                      {updating ? "Updating..." : "Save Changes"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Basic Information Display */}
                    <div>
                      <h3 className="text-lg font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                            Full Name
                          </label>
                          <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                            {userProfile?.name ||
                              user?.displayName ||
                              "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                            Email Address
                          </label>
                          <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark">
                            {user?.email}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                            Phone Number
                          </label>
                          <p className="text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center">
                            <FaPhone className="mr-2 text-theme-text-muted-light dark:text-theme-text-muted-dark" />
                            {userProfile?.phone || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                            Account Status
                          </label>
                          <Badge
                            color={user?.emailVerified ? "success" : "warning"}
                          >
                            {user?.emailVerified
                              ? "Verified Account"
                              : "Email Verification Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4 flex items-center">
                        <FaBell className="mr-2" />
                        Notification Preferences
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                            Email Notifications
                          </label>
                          <Badge
                            color={
                              userProfile?.email_notifications
                                ? "success"
                                : "gray"
                            }
                          >
                            {userProfile?.email_notifications
                              ? "Enabled"
                              : "Disabled"}
                          </Badge>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                            Marketing Communications
                          </label>
                          <Badge
                            color={
                              userProfile?.marketing_opt_in ? "success" : "gray"
                            }
                          >
                            {userProfile?.marketing_opt_in
                              ? "Enabled"
                              : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Account Statistics */}
                    <div>
                      <h3 className="text-lg font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
                        Account Statistics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                            Member Since
                          </label>
                          <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                            {userProfile?.created_at
                              ? new Date(
                                  userProfile.created_at
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                            Last Login
                          </label>
                          <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                            {userProfile?.last_login_at
                              ? new Date(
                                  userProfile.last_login_at
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                            Total Orders
                          </label>
                          <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                            {userProfile?.order_count || 0} orders
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                            Total Spent
                          </label>
                          <p className="text-theme-text-muted-light dark:text-theme-text-muted-dark">
                            {userProfile?.preferred_currency || "USD"}{" "}
                            {userProfile?.total_spent || "0.00"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
                  Order History
                </h2>
                <div className="text-center py-8">
                  <FaShoppingBag className="mx-auto h-12 w-12 text-theme-text-muted-light dark:text-theme-text-muted-dark mb-4" />
                  <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                    No orders yet
                  </p>
                  <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-2">
                    Your order history will appear here
                  </p>
                </div>
              </Card>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Saved Addresses
                  </h2>
                  <Button size="sm" onClick={handleAddAddress}>
                    <FaPlus className="mr-2" />
                    Add Address
                  </Button>
                </div>

                {userProfile?.addresses && userProfile.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.addresses.map((address, index) => (
                      <div
                        key={address._id || index}
                        className="border rounded-lg p-4 border-theme-border-light dark:border-theme-border-dark"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center flex-wrap gap-2">
                            <Badge color="blue" className="mr-1">
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
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-theme-error hover:text-red-800 dark:text-theme-error"
                            >
                              <FaTrash />
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
                  <div className="text-center py-8">
                    <FaMapMarkerAlt className="mx-auto h-12 w-12 text-theme-text-muted-light dark:text-theme-text-muted-dark mb-4" />
                    <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                      No addresses saved
                    </p>
                    <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-2">
                      Add your shipping and billing addresses
                    </p>
                  </div>
                )}
              </Card>
            )}

            {activeTab === "preferences" && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
                  Account Preferences
                </h2>
                <form onSubmit={handleUpdatePreferences} className="space-y-4">
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

                  <Button type="submit" disabled={updating} className="mt-4">
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
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                Address Type
              </label>
              <Select
                value={addressForm.type}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, type: e.target.value })
                }
              >
                <option value="shipping">Shipping Address</option>
                <option value="billing">Billing Address</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                Street Address
              </label>
              <TextInput
                value={addressForm.street}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, street: e.target.value })
                }
                placeholder="Enter street address"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                  City
                </label>
                <TextInput
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, city: e.target.value })
                  }
                  placeholder="City"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                  State/Province
                </label>
                <TextInput
                  value={addressForm.state}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, state: e.target.value })
                  }
                  placeholder="State/Province"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                  Postal Code
                </label>
                <TextInput
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
              <div>
                <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                  Country
                </label>
                <TextInput
                  value={addressForm.country}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, country: e.target.value })
                  }
                  placeholder="Country"
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_default"
                checked={addressForm.is_default}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    is_default: e.target.checked,
                  })
                }
                className="mr-2"
              />
              <label
                htmlFor="is_default"
                className="text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark"
              >
                Set as default address
              </label>
            </div>
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
