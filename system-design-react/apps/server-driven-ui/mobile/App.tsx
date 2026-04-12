import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SDUINode } from './src/core/types';
import { SDUIRenderer } from './src/core/SDUIRenderer';
import { registry } from './src/registry';
import { fetchPage } from './src/mock-server/responses';
import { CartProvider } from './src/CartContext';
import { CartSummary } from './src/components/CartSummary';

type RootStackParamList = {
  Home: undefined;
  Restaurant: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function SDUIPage({ page }: { page: string }) {
  const [node, setNode] = useState<SDUINode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPage(page)
      .then(setNode)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return (
      <View style={appStyles.loading}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={appStyles.error}>
        <Text style={appStyles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!node) return null;

  return (
    <ScrollView style={appStyles.page}>
      <SDUIRenderer node={node} registry={registry} />
    </ScrollView>
  );
}

function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <SDUIPage page="home" />
      <CartSummary />
    </View>
  );
}

function RestaurantScreen({ route }: { route: { params: { id: string } } }) {
  return (
    <View style={{ flex: 1 }}>
      <SDUIPage page={`restaurant-${route.params.id}`} />
      <CartSummary />
    </View>
  );
}

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: 'white' },
            headerTintColor: '#16a34a',
            headerTitleStyle: { fontWeight: '700' },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'FoodDash' }}
          />
          <Stack.Screen
            name="Restaurant"
            component={RestaurantScreen}
            options={{ title: 'Restaurant' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

const appStyles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 64,
  },
  error: {
    padding: 32,
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
  },
});
