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
import {
  createParty,
  getActiveParties,
  getPartyMembers,
  endParty,
  getPartyHistory,
} from "../services/social";
import { subscribeToPartyScores } from "../services/realtime";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FriendCard from "../components/social/FriendCard";
import PartyCard from "../components/social/PartyCard";
import Leaderboard from "../components/social/Leaderboard";
import InviteModal from "../components/social/InviteModal";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

type Tab = "friends" | "parties";

function PartyDetail({
  party,
  partyId,
  currentUserId,
  onEnd,
  onInvite,
}: {
  party: any;
  partyId: string;
  currentUserId: string;
  onEnd: () => void;
  onInvite: () => void;
}) {
  const [members, setMembers] = useState<any[]>([]);

  const loadMembers = useCallback(() => {
    getPartyMembers(partyId).then((data) => setMembers(data || []));
  }, [partyId]);

  // Initial load
  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Live score updates
  useEffect(() => {
    const unsubscribe = subscribeToPartyScores(partyId, () => {
      loadMembers();
    });
    return unsubscribe;
  }, [partyId, loadMembers]);

  return (
    <View className="mb-3">
      <View className="bg-dark-800 rounded-xl p-3 mb-2">
        <Text className="text-white text-lg font-bold">
          {party?.name || "Party"}
        </Text>
        <Text className="text-dark-400 text-xs mt-1">
          Started{" "}
          {party?.started_at
            ? new Date(party.started_at).toLocaleString()
            : "recently"}
        </Text>
        <Text className="text-dark-400 text-xs">
          {members.length} {members.length === 1 ? "member" : "members"}
        </Text>
      </View>

      <Leaderboard
        entries={members.map((m: any, i: number) => ({
          userId: m.user_id,
          username: m.profiles?.username || "Unknown",
          score: m.score || 0,
          rank: i + 1,
        }))}
        currentUserId={currentUserId}
      />

      <View className="flex-row mt-2">
        <Button
          title="Invite Friends"
          variant="outline"
          size="sm"
          onPress={onInvite}
          className="flex-1 mr-2"
        />
        <Button
          title="End Party"
          variant="danger"
          size="sm"
          onPress={onEnd}
          className="flex-1"
        />
      </View>
    </View>
  );
}

export default function SocialScreen() {
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
    pendingInvites,
    inviteFriends,
    acceptInvite,
    declineInvite,
  } = useParty();

  const [tab, setTab] = useState<Tab>("friends");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateParty, setShowCreateParty] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [partyName, setPartyName] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [activeParties, setActiveParties] = useState<any[]>([]);
  const [invitePartyId, setInvitePartyId] = useState<string | null>(null);
  const [invitePartyName, setInvitePartyName] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [partyHistory, setPartyHistory] = useState<any[]>([]);

  const loadParties = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getActiveParties(user.id);
      setActiveParties(data || []);
    } catch (error: any) {
      console.error("Failed to load parties:", error);
    }
  }, [user?.id]);

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
    if (tab === "parties") loadParties();
  }, [tab, loadParties]);

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
      await loadParties();
      // Immediately open invite modal for the new party
      setInvitePartyId(party.id);
      setInvitePartyName(partyName.trim());
      setPartyName("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleEndParty = (partyId: string) => {
    Alert.alert("End Party", "Are you sure you want to end this party?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: async () => {
          await endParty(partyId);
          await loadParties();
          setSelectedPartyId(null);
        },
      },
    ]);
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
      await loadParties();
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

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-white text-2xl font-bold">Social</Text>
      </View>

      {/* Tab Toggle */}
      <View className="flex-row mx-4 mb-4 bg-dark-800 rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setTab("friends")}
          className={`flex-1 py-2 rounded-lg items-center ${
            tab === "friends" ? "bg-primary-600" : ""
          }`}
        >
          <Text
            className={`font-semibold ${
              tab === "friends" ? "text-white" : "text-dark-400"
            }`}
          >
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab("parties")}
          className={`flex-1 py-2 rounded-lg items-center ${
            tab === "parties" ? "bg-primary-600" : ""
          }`}
        >
          <View className="flex-row items-center">
            <Text
              className={`font-semibold ${
                tab === "parties" ? "text-white" : "text-dark-400"
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

            {pendingRequests.length > 0 && (
              <>
                <Text className="text-dark-300 text-sm font-semibold mb-2">
                  Pending Requests
                </Text>
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
                <Text className="text-dark-300 text-sm font-semibold mb-2">
                  Party Invitations
                </Text>
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

            {/* Active Parties */}
            {activeParties.length > 0 && (
              <Text className="text-dark-300 text-sm font-semibold mb-2 mt-2">
                Active Parties
              </Text>
            )}
            {activeParties.map((p: any) => (
              <View key={p.party_id}>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedPartyId(
                      selectedPartyId === p.party_id ? null : p.party_id
                    )
                  }
                >
                  <PartyCard
                    name={p.parties?.name || "Party"}
                    memberCount={p.parties?.party_members?.[0]?.count || 1}
                    isActive={p.parties?.is_active || false}
                    userScore={p.score}
                  />
                </TouchableOpacity>
                {selectedPartyId === p.party_id && (
                  <PartyDetail
                    party={p.parties}
                    partyId={p.party_id}
                    currentUserId={user?.id || ""}
                    onEnd={() => handleEndParty(p.party_id)}
                    onInvite={() => {
                      setInvitePartyId(p.party_id);
                      setInvitePartyName(p.parties?.name || "Party");
                    }}
                  />
                )}
              </View>
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
