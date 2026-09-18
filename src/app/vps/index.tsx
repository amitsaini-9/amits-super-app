import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, Pressable, ScrollView, Alert, RefreshControl } from 'react-native';
import { Page, Copy, Field, usePalette } from '@/components/workspace-ui';
import { Spacing as S, Type, Radius } from '@/constants/theme';
import { Stack } from 'expo-router';

// We will replace this with the actual deployed URL once it's ready
const API_URL = 'https://asia-southeast1-learning-project-505117.cloudfunctions.net/vps-dashboard-api-amit'; 

export default function VPSDashboard() {
  const c = usePalette();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to fetch VPS status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const sendAction = async (action) => {
    Alert.alert(
      `Confirm ${action}`,
      `Are you sure you want to ${action} the VPS?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
              });
              if (!res.ok) {
                  const errData = await res.json();
                  throw new Error(errData.error?.message || 'Action failed');
              }
              Alert.alert('Success', `Command '${action}' sent successfully.`);
              setTimeout(fetchStatus, 3000); // refresh after a bit
            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const getLatestMetric = (metricObj) => {
    if (!metricObj || !metricObj.usage) return null;
    const timestamps = Object.keys(metricObj.usage).sort((a, b) => Number(b) - Number(a));
    if (timestamps.length === 0) return null;
    return metricObj.usage[timestamps[0]];
  };

  const renderContent = () => {
    if (loading && !data) return <ActivityIndicator size="large" color={c.accent} />;
    if (!data) return <Copy>No data available</Copy>;

    // data actually contains { details, metrics } from the proxy API
    const vpsDetails = data.details || {};
    const vps = Array.isArray(vpsDetails) ? vpsDetails[0] : vpsDetails;
    const metrics = data.metrics || {};

    const latestCpu = getLatestMetric(metrics.cpu_usage);
    const latestRam = getLatestMetric(metrics.ram_usage);
    const latestDisk = getLatestMetric(metrics.disk_space);

    const cpuText = latestCpu !== null ? `${latestCpu.toFixed(1)}%` : `${vps.cpus} Cores`;
    const ramText = latestRam !== null ? `${(latestRam / 1024 / 1024 / 1024).toFixed(1)} GB / ${(vps.memory / 1024).toFixed(1)} GB` : `${(vps.memory / 1024).toFixed(1)} GB`;
    const diskText = latestDisk !== null ? `${(latestDisk / 1024 / 1024 / 1024).toFixed(1)} GB / ${(vps.disk / 1024).toFixed(1)} GB` : `${(vps.disk / 1024).toFixed(1)} GB`;

    return (
      <View style={{ gap: S.four }}>
        <View style={{ backgroundColor: c.surface, padding: S.four, borderRadius: Radius.large, borderWidth: 1, borderColor: c.line, gap: S.two }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Copy title>{vps.hostname || 'Unknown VPS'}</Copy>
            <View style={{ backgroundColor: vps.state === 'running' ? '#4CAF50' : '#F44336', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>{vps.state?.toUpperCase() || 'UNKNOWN'}</Text>
            </View>
          </View>
          <Copy muted>IP: {vps.ipv4?.[0]?.address || 'N/A'}</Copy>
          <View style={{ height: 1, backgroundColor: c.line, marginVertical: S.two }} />
          <View style={{ gap: S.two }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Copy muted>CPU Usage</Copy>
              <Copy>{cpuText}</Copy>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Copy muted>RAM Usage</Copy>
              <Copy>{ramText}</Copy>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Copy muted>Disk Used</Copy>
              <Copy>{diskText}</Copy>
            </View>
          </View>
        </View>

        <Copy title>Controls</Copy>
        <View style={{ flexDirection: 'row', gap: S.two }}>
          <ActionButton label="Start" icon="▶️" onPress={() => sendAction('start')} disabled={vps.state === 'running' || actionLoading} c={c} />
          <ActionButton label="Restart" icon="🔄" onPress={() => sendAction('restart')} disabled={vps.state !== 'running' || actionLoading} c={c} />
          <ActionButton label="Stop" icon="⏹️" onPress={() => sendAction('stop')} disabled={vps.state !== 'running' || actionLoading} c={c} />
        </View>
        
        {actionLoading && <ActivityIndicator color={c.accent} style={{ marginTop: S.two }} />}
      </View>
    );
  };

  return (
    <Page>
      <Stack.Screen options={{ title: 'VPS Studio' }} />
      <ScrollView 
        contentContainerStyle={{ gap: S.four, paddingVertical: S.four }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStatus} />}
      >
        <Copy title style={{ fontSize: 28 }}>VPS Studio</Copy>
        <Copy muted>Manage your Hostinger server directly.</Copy>
        {renderContent()}
      </ScrollView>
    </Page>
  );
}

function ActionButton({ label, icon, onPress, disabled, c }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: c.surface,
        padding: S.three,
        borderRadius: Radius.medium,
        alignItems: 'center',
        gap: S.one,
        borderWidth: 1,
        borderColor: c.line,
        opacity: disabled ? 0.5 : (pressed ? 0.8 : 1)
      })}
    >
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Copy style={{ fontWeight: '600', color: disabled ? c.text : c.accent }}>{label}</Copy>
    </Pressable>
  );
}
