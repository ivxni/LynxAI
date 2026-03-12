import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../utils/i18n';
import useThemeColors from '../utils/useThemeColors';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

interface FamilyMember {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  joinedAt: string;
  status: 'active' | 'pending' | 'removed';
}

interface PendingInvitation {
  email: string;
  invitedAt: string;
  invitedBy: {
    firstName: string;
    lastName: string;
  };
}

interface FamilyGroup {
  _id: string;
  name: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members: FamilyMember[];
  pendingInvitations: PendingInvitation[];
  subscription: {
    documentLimitTotal: number;
    documentLimitUsed: number;
    documentLimitResetDate: string;
  };
  settings: {
    maxMembers: number;
  };
}

export default function FamilyDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const themeColors = useThemeColors();
  
  const [familyGroup, setFamilyGroup] = useState<FamilyGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadFamilyGroup();
  }, []);

  const loadFamilyGroup = async () => {
    try {
      setLoading(true);
      // Placeholder data until the family API endpoint is connected
      setFamilyGroup({
        _id: '1',
        name: 'Johnson Family',
        owner: {
          _id: user?._id || '1',
          firstName: user?.firstName || 'John',
          lastName: user?.lastName || 'Doe',
          email: user?.email || 'john@example.com',
        },
        members: [
          {
            _id: '2',
            user: {
              _id: '2',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
            },
            joinedAt: '2024-01-15T10:30:00Z',
            status: 'active',
          },
        ],
        pendingInvitations: [
          {
            email: 'bob@example.com',
            invitedAt: '2024-01-20T14:00:00Z',
            invitedBy: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        ],
        subscription: {
          documentLimitTotal: 150,
          documentLimitUsed: 45,
          documentLimitResetDate: '2024-02-01T00:00:00Z',
        },
        settings: {
          maxMembers: 4,
        },
      });
    } catch (error) {
      console.error('Error loading family group:', error);
      Alert.alert('Error', 'Failed to load family group');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!isValidEmail(inviteEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setInviting(true);
      
      Alert.alert('Success', `Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      await loadFamilyGroup();
    } catch (error) {
      console.error('Error inviting member:', error);
      Alert.alert('Error', 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from your family plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              Alert.alert('Success', `${memberName} has been removed from your family plan`);
              await loadFamilyGroup();
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isOwner = familyGroup?.owner._id === user?._id;
  const totalMembers = (familyGroup?.members.length || 0) + 1; // +1 for owner
  const canAddMoreMembers = totalMembers < (familyGroup?.settings.maxMembers || 4);
  const documentUsagePercentage = familyGroup ? 
    (familyGroup.subscription.documentLimitUsed / familyGroup.subscription.documentLimitTotal) * 100 : 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            Loading family dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!familyGroup) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>Family Dashboard</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <MaterialIcons name="family-restroom" size={64} color={themeColors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No Family Plan</Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            You need a family subscription to access this feature
          </Text>
          <Button 
            onPress={() => router.push('/(app)/subscription-plans')}
            style={styles.upgradeButton}
          >
            Upgrade to Family Plan
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>Family Dashboard</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Family Overview */}
        <LinearGradient
          colors={[themeColors.primary + '15', themeColors.primaryLight + '05']}
          style={styles.overviewCard}
        >
          <View style={styles.overviewHeader}>
            <MaterialIcons name="family-restroom" size={32} color={themeColors.primary} />
            <View style={styles.overviewText}>
              <Text style={[styles.familyName, { color: themeColors.text }]}>
                {familyGroup.name}
              </Text>
              <Text style={[styles.memberCount, { color: themeColors.textSecondary }]}>
                {totalMembers} of {familyGroup.settings.maxMembers} members
              </Text>
            </View>
          </View>
          
          {/* Document Usage */}
          <View style={styles.usageContainer}>
            <Text style={[styles.usageTitle, { color: themeColors.text }]}>
              Document Usage This Month
            </Text>
            <View style={styles.usageBar}>
              <View 
                style={[
                  styles.usageProgress, 
                  { 
                    backgroundColor: themeColors.primary,
                    width: `${Math.min(documentUsagePercentage, 100)}%` 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.usageText, { color: themeColors.textSecondary }]}>
              {familyGroup.subscription.documentLimitUsed} of {familyGroup.subscription.documentLimitTotal} documents used
            </Text>
          </View>
        </LinearGradient>

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Family Members</Text>
          
          {/* Owner */}
          <View style={[styles.memberCard, { backgroundColor: themeColors.surface }]}>
            <MaterialIcons name="star" size={24} color={themeColors.warning} />
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: themeColors.text }]}>
                {familyGroup.owner.firstName} {familyGroup.owner.lastName}
              </Text>
              <Text style={[styles.memberEmail, { color: themeColors.textSecondary }]}>
                {familyGroup.owner.email}
              </Text>
              <Text style={[styles.memberRole, { color: themeColors.warning }]}>
                Owner
              </Text>
            </View>
          </View>

          {/* Active Members */}
          {familyGroup.members.map((member) => (
            <View key={member._id} style={[styles.memberCard, { backgroundColor: themeColors.surface }]}>
              <MaterialIcons name="person" size={24} color={themeColors.primary} />
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: themeColors.text }]}>
                  {member.user.firstName} {member.user.lastName}
                </Text>
                <Text style={[styles.memberEmail, { color: themeColors.textSecondary }]}>
                  {member.user.email}
                </Text>
                <Text style={[styles.memberJoined, { color: themeColors.textSecondary }]}>
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </Text>
              </View>
              {isOwner && (
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member._id, `${member.user.firstName} ${member.user.lastName}`)}
                  style={styles.removeButton}
                >
                  <MaterialIcons name="remove-circle" size={24} color={themeColors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Pending Invitations */}
        {familyGroup.pendingInvitations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Pending Invitations</Text>
            {familyGroup.pendingInvitations.map((invitation, index) => (
              <View key={index} style={[styles.memberCard, { backgroundColor: themeColors.surfaceVariant }]}>
                <MaterialIcons name="mail-outline" size={24} color={themeColors.textSecondary} />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, { color: themeColors.text }]}>
                    {invitation.email}
                  </Text>
                  <Text style={[styles.memberJoined, { color: themeColors.textSecondary }]}>
                    Invited {new Date(invitation.invitedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Invite New Member */}
        {isOwner && canAddMoreMembers && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Invite New Member</Text>
            <View style={[styles.inviteCard, { backgroundColor: themeColors.surface }]}>
              <TextInput
                style={[styles.emailInput, { 
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                }]}
                placeholder="Enter email address"
                placeholderTextColor={themeColors.textSecondary}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Button
                onPress={handleInviteMember}
                loading={inviting}
                style={styles.inviteButton}
              >
                Send Invite
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  upgradeButton: {
    marginTop: 16,
  },
  overviewCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewText: {
    marginLeft: 12,
    flex: 1,
  },
  familyName: {
    fontSize: 20,
    fontWeight: '700',
  },
  memberCount: {
    fontSize: 14,
    marginTop: 2,
  },
  usageContainer: {
    marginTop: 16,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  usageBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  usageProgress: {
    height: '100%',
    borderRadius: 4,
  },
  usageText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  memberRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  memberJoined: {
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  inviteCard: {
    padding: 16,
    borderRadius: 12,
  },
  emailInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  inviteButton: {
    marginTop: 8,
  },
}); 