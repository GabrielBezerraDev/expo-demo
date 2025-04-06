import { Card } from "@/components/Card";
import { OrderInterfaceGet } from "@/interfaces/OrderInterface";
import { supabase } from "@/services/supabase";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Button,
  Alert,
} from "react-native";

const ListComponent = () => {
  const [orders, setOrder] = useState<OrderInterfaceGet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from("Order")
      .select()
      .eq("finishOrder", false);

    setOrder(data as OrderInterfaceGet[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
        <Button title="Recarregar" onPress={fetchOrder} color={"#FFA500"} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchOrder();
          }}
        />
      }
      contentContainerStyle={styles.listContainer}
    >
      {orders.map((order, index) => (
        <Card key={index} order={order} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: "100%",
    backgroundColor: "#fff"
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  listContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default ListComponent;
