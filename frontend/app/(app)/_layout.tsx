import React from 'react';
import { Stack } from 'expo-router';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function AppLayout() {
  return (
    <ProtectedRoute>
      <Stack>
        <Stack.Screen 
          name="dashboard" 
          options={{ 
            title: 'Dashboard',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="upload" 
          options={{ 
            title: 'Upload Document',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="history" 
          options={{ 
            title: 'Document History',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: 'Profile',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="language" 
          options={{ 
            title: 'Language',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="darkmode" 
          options={{ 
            title: 'Darkmode',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="editprofile" 
          options={{ 
            title: 'Edit Profile',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="changepassword" 
          options={{ 
            title: 'Change Password',
            headerShown: false
          }} 
        />
        <Stack.Screen 
          name="subscription-plans" 
          options={{ 
            title: 'Subscription Plans',
            headerShown: false
          }} 
        />
      </Stack>
    </ProtectedRoute>
  );
} 