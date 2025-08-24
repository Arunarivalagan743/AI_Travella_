# Follow Request System Debugging Guide

If you're experiencing issues with the follow request system, use this guide to diagnose and fix common problems.

## Common Issues and Solutions

### 1. Follow requests not being sent or received

**Check the user documents in Firestore:**
- Verify that both user documents exist
- Confirm that the `followRequestsSent` and `followRequestsReceived` arrays are being updated

**Fix:**
```javascript
// Example: Manually verify arrays exist on user document
const userRef = doc(db, "users", userEmail);
const userDoc = await getDoc(userRef);
if (userDoc.exists()) {
  const userData = userDoc.data();
  console.log("Follow requests sent:", userData.followRequestsSent || []);
  console.log("Follow requests received:", userData.followRequestsReceived || []);
  
  // If arrays don't exist, update the document
  if (!userData.followRequestsSent || !userData.followRequestsReceived) {
    await updateDoc(userRef, {
      followRequestsSent: userData.followRequestsSent || [],
      followRequestsReceived: userData.followRequestsReceived || []
    });
  }
}
```

### 2. UI not showing correct follow status

**Check for status calculation issues:**
- Make sure the correct status is being calculated based on all arrays
- Verify that the component is receiving the correct status

**Fix:**
```javascript
const checkFollowStatus = (userEmail, targetEmail) => {
  const following = userProfiles[userEmail]?.following || [];
  const requestsSent = userProfiles[userEmail]?.followRequestsSent || [];
  const requestsReceived = userProfiles[userEmail]?.followRequestsReceived || [];
  
  if (following.includes(targetEmail)) return 'following';
  if (requestsSent.includes(targetEmail)) return 'requested';
  if (requestsReceived.includes(targetEmail)) return 'pending';
  return 'none';
};
```

### 3. Permissions errors when updating follow requests

**Check Firestore rules:**
- Ensure your rules allow updating the follow request arrays
- Verify rules work for both sender and recipient

**Test rules with simulators:**
- Use the Firebase Console Rules Playground to test various operations
- Verify that array operations work correctly

### 4. Follow requests not showing in Follower Requests page

**Check component rendering:**
- Make sure the page is fetching both sent and received requests
- Verify that the correct tabs are shown based on available data

**Fix:**
```javascript
// Add debugging in the component
useEffect(() => {
  if (!user) return;
  console.log("Current user email:", user.email);
  
  const fetchFollowRequests = async () => {
    const userRef = doc(db, "users", user.email);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("Received requests:", userData.followRequestsReceived || []);
      console.log("Sent requests:", userData.followRequestsSent || []);
      // Set state accordingly
    }
  };
  
  fetchFollowRequests();
}, [user]);
```
