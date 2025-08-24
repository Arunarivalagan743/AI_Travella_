# Follower Request System Update

## Overview
This update adds a new follower request system to TravellaAI. Instead of directly following another user, users will now need to send a follow request which the recipient can accept or reject.

## Features Added
1. **Follow Request System**:
   - When a user wants to follow another user, it sends a request first
   - The recipient can accept or reject the request
   - Users can see their pending requests (both sent and received)
   - Users can withdraw their follow requests

2. **New Follower Requests Page**:
   - Shows requests received tab where users can accept/reject follow requests
   - Shows requests sent tab where users can withdraw pending follow requests
   - Accessible from header dropdown menu

3. **Updated Social Interactions**:
   - Updated follow button shows different states:
     - "Follow" (for sending a new request)
     - "Requested" (for pending sent requests)
     - "Accept Request" (for pending received requests)
     - "Following" (for users you're already following)

4. **Updated Header Component**:
   - Added "Follower Requests" menu item in both desktop and mobile views

## Database Changes
- Added two new fields to user documents:
  - `followRequestsSent`: Array of user emails to whom this user has sent follow requests
  - `followRequestsReceived`: Array of user emails from whom this user has received follow requests

## Security Rules Updates
- Updated Firestore security rules to allow follow request operations

## Implementation Details
- Used `arrayUnion` and `arrayRemove` for secure Firestore array operations
- Added real-time updates with Firestore `onSnapshot` to refresh request statuses
- Implemented user-friendly toast notifications for follow request actions
- Added proper error handling for all operations
