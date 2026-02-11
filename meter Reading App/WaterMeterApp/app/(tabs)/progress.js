import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons'; // Icon සඳහා


const API_BASE_URL = 'http://10.10.35.59:3000/api'; 

export default function ProgressScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  // Sorting State
  const [sortBy, setSortBy] = useState('progress'); // 'progress' or 'users'
  const [order, setOrder] = useState('desc');       // 'asc' or 'desc'

  // Current Date Info
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // 1. Initial Load
  useEffect(() => {
    loadUserData();
  }, []);

  // 2. User Data ගත්තට පස්සේ Progress එක ගන්න
  useEffect(() => {
    if (userData) {
      fetchProgress();
    }
  }, [userData, sortBy, order]); // Sort වෙනස් වෙනකොටත් Auto refresh වෙනවා

  const loadUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData');
      if (jsonValue != null) {
        setUserData(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Error loading user", e);
    }
  };

  const fetchProgress = async () => {
    if (!userData) return;
    
    setLoading(true);
    try {
      // ✅ ඔබ දුන් Controller එකට අනුව Query Params යැවීම
      const response = await axios.get(`${API_BASE_URL}/water-project-progress`, {
        params: {
          sabha_code: userData.sabha,
          month: currentMonth,
          year: currentYear,
          sort_by: sortBy,
          order: order
        }
      });

      if (response.data.status === 'success') {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Fetch Error", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProgress();
  }, [userData, sortBy, order]);

  // Sorting Handler
  const toggleSort = (type) => {
    if (sortBy === type) {
      // එකම Type එක නම් Order එක මාරු කරන්න (asc <-> desc)
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      // අලුත් Type එකක් නම්, Default desc කරන්න
      setSortBy(type);
      setOrder('desc');
    }
  };

  // --- UI Components ---

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Project Progress</Text>
      <Text style={styles.subTitle}>
        {new Date().toLocaleString('default', { month: 'long' })} {currentYear}
      </Text>

      {/* Sorting Buttons */}
      <View style={styles.sortRow}>
        <TouchableOpacity 
          style={[styles.sortBtn, sortBy === 'progress' && styles.activeSortBtn]} 
          onPress={() => toggleSort('progress')}
        >
          <Text style={[styles.sortBtnText, sortBy === 'progress' && styles.activeSortText]}>
            Sort by Progress {sortBy === 'progress' && (order === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sortBtn, sortBy === 'users' && styles.activeSortBtn]} 
          onPress={() => toggleSort('users')}
        >
          <Text style={[styles.sortBtnText, sortBy === 'users' && styles.activeSortText]}>
            Sort by Users {sortBy === 'users' && (order === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* --- Header Section (Project Name & %) --- */}
      <View style={styles.cardHeader}>
        <View style={styles.headerInfo}>
            <Text style={styles.projectCode}>{item.project_code}</Text>
            <Text style={styles.projectName} numberOfLines={2}>{item.project_name}</Text>
        </View>
        
        <View style={styles.percentageBadge}>
            <Text style={[
                styles.percentageText, 
                { color: item.progress_percentage >= 100 ? '#27ae60' : '#58071b' }
            ]}>
            {item.progress_percentage}%
            </Text>
        </View>
      </View>

      {/* --- Progress Bar --- */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
            <View 
                style={[
                    styles.progressBarFill, 
                    { 
                        width: `${Math.min(item.progress_percentage, 100)}%`,
                        backgroundColor: item.progress_percentage >= 100 ? '#27ae60' : '#f39c12'
                    }
                ]} 
            />
        </View>
      </View>

      {/* --- Modern Stats Row (Boxes) --- */}
      <View style={styles.statsContainer}>
        
        {/* Total Users Box */}
        <View style={[styles.statBox, { backgroundColor: '#fdf2f4' }]}> 
            <FontAwesome name="users" size={16} color="#58071b" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: '#58071b' }]}>{item.total_users}</Text>
            <Text style={styles.statLabel}>Total</Text>
        </View>

        {/* Completed Box */}
        <View style={[styles.statBox, { backgroundColor: '#eafaf1' }]}> 
            <FontAwesome name="check-circle" size={16} color="#27ae60" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: '#27ae60' }]}>{item.completed_readings}</Text>
            <Text style={styles.statLabel}>Done</Text>
        </View>

        {/* Pending Box */}
        <View style={[styles.statBox, { backgroundColor: '#fff5e6' }]}> 
            <FontAwesome name="clock-o" size={16} color="#d35400" style={styles.statIcon} />
            <Text style={[styles.statValue, { color: '#d35400' }]}>
                {item.total_users - item.completed_readings}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
        </View>

      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.project_code ? item.project_code.toString() : index.toString()}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#58071b']} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
                <Text>No Data Found</Text>
            </View>
          )
        }
      />
      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#58071b" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  headerContainer: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 26, // අකුරු ටිකක් ලොකු කළා
    fontWeight: '800',
    color: '#58071b',
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
    marginTop: 4,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sortBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    elevation: 1, // පොඩි shadow එකක්
  },
  activeSortBtn: {
    backgroundColor: '#58071b',
    borderColor: '#58071b',
    elevation: 3,
  },
  sortBtnText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  activeSortText: {
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)'
  },

  // --- MODERN CARD STYLES ---
  card: {
    backgroundColor: '#fff',
    borderRadius: 16, // රවුම් දාර
    padding: 20,      // ඇතුලේ ඉඩ වැඩි කළා
    marginBottom: 16,
    // Modern Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android Elevation
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  headerInfo: {
    flex: 1,
    marginRight: 10,
  },
  projectCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#95a5a6',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    lineHeight: 24,
  },
  percentageBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '900',
  },
  
  // Progress Bar
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 10, // තීරුව ටිකක් මහත කළා
    backgroundColor: '#edf2f7',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 10,
  },

  // Stats Grid (The Boxes)
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statBox: {
    flex: 1, // සමානව ඉඩ බෙදා ගනී
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 12,
    // Box එක ඇතුලේ දේවල් මැදට ගන්න
    justifyContent: 'center',
  },
  statIcon: {
    marginBottom: 6,
    opacity: 0.8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});