import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../providers/AuthProvider";
import { useFriends } from "../hooks/useFriends";
import { useParty } from "../hooks/useParty";
import { createParty, getPartyHistory } from "../services/social";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import FriendCard from "../components/social/FriendCard";
import PartyCard from "../components/social/PartyCard";
import InviteModal from "../components/social/InviteModal";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

type Tab = "friends" | "parties";

export default function SocialScreen({ navigation }: any) {
  const { user } = useAuth();
  const {
    friends,
    pendingRequests,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  } = useFriends();

  const {
    activeParties,
    pendingInvites,
    inviteFriends,
    acceptInvite,
    declineInvite,
    refreshParties,
  } = useParty();

  const [tab, setTab] = useState<Tab>("friends");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [partyName, setPartyName] = useState("");
  const [invitePartyId, setInvitePartyId] = useState<string | null>(null);
  const [invitePartyName, setInvitePartyName] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [partyHistory, setPartyHistory] = useState<any[]>([]);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getPartyHistory(user.id);
      setPartyHistory(data || []);
    } catch (error: any) {
      console.error("Failed to load party history:", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (showHistory) loadHistory();
  }, [showHistory, loadHistory]);

  const handleSendFriendRequest = async () => {
    if (!friendUsername.trim()) return;
    try {
      await sendRequest(friendUsername.trim());
      setFriendUsername("");
      setShowAddFriend(false);
      Alert.alert("Success", "Friend request sent!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Could not send friend request. Make sure the username is correct."
      );
    }
  };

  const handleCreateParty = async () => {
    if (!partyName.trim() || !user) return;
    try {
      const party = await createParty(partyName.trim(), user.id);
      setShowCreateParty(false);
      await refreshParties();
      // Immediately open invite modal for the new party
      setInvitePartyId(party.id);
      setInvitePartyName(partyName.trim());
      setPartyName("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleInvite = async (friendIds: string[]) => {
    if (!invitePartyId) return;
    try {
      await inviteFriends(invitePartyId, friendIds);
      Alert.alert("Success", "Invitations sent!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send invitations.");
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await acceptInvite(inviteId);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join party.");
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await declineInvite(inviteId);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to decline invite.");
    }
  };

  const getFriendProfile = (friendship: any) => {
    if (friendship.requester?.id === user?.id) {
      return friendship.addressee;
    }
    return friendship.requester;
  };

  const getInviteFriendsList = () => {
    return friends.map((f: any) => {
      const profile = getFriendProfile(f);
      return { id: profile?.id || "", username: profile?.username || "Unknown" };
    });
  };

  const navigateToParty = (p: any) => {
    navigation.navigate("PartyDetail", {
      partyId: p.party_id,
      partyName: p.parties?.name || "Party",
      isCreator: p.parties?.created_by === user?.id,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">Social</Text>
      </View>

      {/* Tab Toggle */}
      <View className="flex-row mx-4 mb-4 bg-dark-800 rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setTab("friends")}
          className={`flex-1 py-2 rounded-lg items-center ${tab === "friends" ? "bg-primary-600" : ""
            }`}
        >
          <View className="flex-row items-center">
            <Text
              className={`font-semibold ${tab === "friends" ? "text-white" : "text-dark-400"
                }`}
            >
              Friends
            </Text>
            {pendingRequests.length > 0 && (
              <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center ml-1.5">
                <Text className="text-white text-xs font-bold">
                  {pendingRequests.length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("parties")}
          className={`flex-1 py-2 rounded-lg items-center ${tab === "parties" ? "bg-primary-600" : ""
            }`}
        >
          <View className="flex-row items-center">
            <Text
              className={`font-semibold ${tab === "parties" ? "text-white" : "text-dark-400"
                }`}
            >
              Parties
            </Text>
            {pendingInvites.length > 0 && (
              <View className="bg-red-500 rounded-full w-5 h-5 items-center justify-center ml-1.5">
                <Text className="text-white text-xs font-bold">
                  {pendingInvites.length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {tab === "friends" ? (
          <>
            <Button
              title="Add Friend"
              variant="outline"
              size="sm"
              onPress={() => setShowAddFriend(true)}
              icon={
                <Ionicons
                  name="person-add-outline"
                  size={16}
                  color="#818CF8"
                />
              }
              className="mb-4"
            />

            {/* Friend Requests Section */}
            {pendingRequests.length > 0 && (
              <>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="mail-outline" size={16} color="#818CF8" />
                  <Text className="text-primary-400 text-sm font-semibold ml-1.5">
                    Friend Requests ({pendingRequests.length})
                  </Text>
                  <Badge label="Live" variant="success" size="sm" />
                </View>
                {pendingRequests.map((req: any) => (
                  <FriendCard
                    key={req.id}
                    username={req.requester?.username || "Unknown"}
                    isPending
                    onAccept={() => acceptRequest(req.id)}
                    onDecline={() => declineRequest(req.id)}
                  />
                ))}
              </>
            )}

            <Text className="text-dark-300 text-sm font-semibold mb-2 mt-2">
              Friends ({friends.length})
            </Text>
            {friends.map((f: any) => {
              const profile = getFriendProfile(f);
              return (
                <FriendCard
                  key={f.id}
                  username={profile?.username || "Unknown"}
                  onRemove={() => removeFriend(f.id)}
                />
              );
            })}

            {friends.length === 0 && pendingRequests.length === 0 && (
              <View className="items-center py-12">
                <Ionicons name="people-outline" size={48} color="#334155" />
                <Text className="text-dark-400 text-base mt-4">
                  No friends yet. Add some!
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Button
              title="Create Party"
              variant="outline"
              size="sm"
              onPress={() => setShowCreateParty(true)}
              icon={
                <Ionicons
                  name="add-circle-outline"
                  size={16}
                  color="#818CF8"
                />
              }
              className="mb-4"
            />

            {/* Pending Party Invitations */}
            {pendingInvites.length > 0 && (
              <>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="mail-outline" size={16} color="#818CF8" />
                  <Text className="text-primary-400 text-sm font-semibold ml-1.5">
                    Party Invitations ({pendingInvites.length})
                  </Text>
                  <Badge label="Live" variant="success" size="sm" />
                </View>
                {pendingInvites.map((inv: any) => (
                  <Card key={inv.id} className="mb-2">
                    <View className="flex-row items-center">
                      <View className="flex-1">
                        <Text className="text-white font-semibold">
                          {inv.parties?.name || "Party"}
                        </Text>
                        <Text className="text-dark-400 text-xs">
                          from {inv.inviter?.username || "Unknown"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleAcceptInvite(inv.id)}
                        className="bg-green-500/20 rounded-lg px-3 py-1.5 mr-2"
                      >
                        <Text className="text-green-400 font-semibold text-sm">
                          Join
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeclineInvite(inv.id)}
                        className="bg-dark-700 rounded-lg px-3 py-1.5"
                      >
                        <Text className="text-dark-300 font-semibold text-sm">
                          Decline
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}
              </>
            )}

            {/* Active Parties — tap to navigate to detail */}
            {activeParties.length > 0 && (
              <Text className="text-dark-300 text-sm font-semibold mb-2 mt-2">
                Active Parties
              </Text>
            )}
            {activeParties.map((p: any) => (
              <PartyCard
                key={p.party_id}
                name={p.parties?.name || "Party"}
                memberCount={p.parties?.party_members?.[0]?.count || 1}
                isActive={p.parties?.is_active || false}
                userScore={p.score}
                onPress={() => navigateToParty(p)}
              />
            ))}

            {activeParties.length === 0 && pendingInvites.length === 0 && (
              <View className="items-center py-12">
                <Ionicons name="trophy-outline" size={48} color="#334155" />
                <Text className="text-dark-400 text-base mt-4">
                  No active parties. Create one to compete!
                </Text>
              </View>
            )}

            {/* Party History */}
            <Button
              title={showHistory ? "Hide History" : "Past Parties"}
              variant="ghost"
              size="sm"
              onPress={() => setShowHistory(!showHistory)}
              className="mt-4 mb-2"
            />
            {showHistory &&
              partyHistory.map((p: any) => (
                <PartyCard
                  key={p.party_id}
                  name={p.parties?.name || "Party"}
                  memberCount={1}
                  isActive={false}
                  userScore={p.score}
                />
              ))}
            {showHistory && partyHistory.length === 0 && (
              <Text className="text-dark-400 text-sm text-center py-4">
                No past parties yet.
              </Text>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        title="Add Friend"
      >
        <Input
          label="Username"
          placeholder="Enter friend's username"
          autoCapitalize="none"
          value={friendUsername}
          onChangeText={setFriendUsername}
        />
        <Button
          title="Send Request"
          onPress={handleSendFriendRequest}
          className="mt-2"
        />
      </Modal>

      {/* Create Party Modal */}
      <Modal
        visible={showCreateParty}
        onClose={() => setShowCreateParty(false)}
        title="Create Party"
      >
        <Input
          label="Party Name"
          placeholder="e.g., Leg Day Battle"
          value={partyName}
          onChangeText={setPartyName}
        />
        <Button
          title="Create"
          onPress={handleCreateParty}
          className="mt-2"
        />
      </Modal>

      {/* Invite Friends Modal */}
      <InviteModal
        visible={invitePartyId !== null}
        onClose={() => setInvitePartyId(null)}
        friends={getInviteFriendsList()}
        onInvite={handleInvite}
        partyName={invitePartyName}
      />
    </SafeAreaView>
  );
}
