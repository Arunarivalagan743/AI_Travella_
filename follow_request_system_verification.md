// Follow Request System Updates - Notes

1. Updated components to handle follow requests:
   - When a user clicks "Follow", a request is sent instead of directly following
   - Added UI states for different follow statuses: Following, Requested, Accept, Follow

2. Added new fields to user documents:
   - followRequestsSent: Array of emails to whom the user has sent follow requests
   - followRequestsReceived: Array of emails from whom the user has received follow requests

3. Created a Follower Requests page for users to:
   - Accept/reject incoming follow requests
   - See and withdraw outgoing follow requests

4. Updated security rules to allow:
   - Modification of follow request arrays
   - Users to accept/reject follow requests

5. Deployment:
   1. Copy the updated Firestore rules to the main firestore.rules file
   2. Deploy using the script: `node deploy-firestore-rules.js`
   3. Verify that the rules allow follow request operations

6. Testing checklist:
   - User A can send a follow request to User B
   - User B sees the request in their Follower Requests page
   - User B can accept the request, making User A a follower
   - User B can reject the request, removing it from both users' arrays
   - User A can withdraw their request before User B responds
