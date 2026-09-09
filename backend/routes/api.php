<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\LogoutController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\TwoFactorController;
use App\Http\Controllers\Api\V1\Auth\OAuthController;
use App\Http\Controllers\Api\V1\Auth\SessionController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\FeedController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\ReactionController;
use App\Http\Controllers\Api\V1\FollowController;
use App\Http\Controllers\Api\V1\FriendController;
use App\Http\Controllers\Api\V1\BlockController;
use App\Http\Controllers\Api\V1\StoryController;
use App\Http\Controllers\Api\V1\ReelController;
use App\Http\Controllers\Api\V1\VideoController;
use App\Http\Controllers\Api\V1\CallController;
use App\Http\Controllers\Api\V1\GameController;
use App\Http\Controllers\Api\V1\UserGameController;
use App\Http\Controllers\Api\V1\GroupController;
use App\Http\Controllers\Api\V1\NewsController;
use App\Http\Controllers\Api\V1\MessageController;
use App\Http\Controllers\Api\V1\ConversationController;
use App\Http\Controllers\Api\V1\TournamentController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\HashtagController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\UploadController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\AchievementController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AdminPostController;
use App\Http\Controllers\Api\V1\Admin\AdminGameController;
use App\Http\Controllers\Api\V1\Admin\AdminNewsController;
use App\Http\Controllers\Api\V1\Admin\AdminGroupController;
use App\Http\Controllers\Api\V1\Admin\AdminTournamentController;
use App\Http\Controllers\Api\V1\Admin\AdminAuditLogController;
use App\Http\Controllers\Api\V1\Admin\AdminReportController;
use App\Http\Controllers\Api\V1\Admin\AdminAnalyticsController;
use App\Http\Controllers\Api\V1\Admin\AdminModerationController;

/*
|--------------------------------------------------------------------------
| API Routes - GameSphere v1
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1
| Auth: Laravel Sanctum
|
*/

Route::get('/login', fn () => response()->json(['message' => 'Unauthenticated.'], 401))->name('login');
Route::get('/v1/auth/verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])->name('verification.verify');

Route::prefix('v1')->name('api.v1.')->group(function () {

    // ─── Public endpoints ───────────────────────────────────────────

    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('/register', [RegisterController::class, 'register'])->name('register')
            ->middleware('throttle:5,1');
        Route::post('/login', [LoginController::class, 'login'])->name('login')
            ->middleware('throttle:10,1');
        Route::post('/forgot-password', [PasswordResetController::class, 'sendLink'])->name('password.forgot')
            ->middleware('throttle:3,1');
        Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('password.reset')
            ->middleware('throttle:3,1');

        // Email verification (public but signed)
        Route::get('/verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->middleware(['signed', 'throttle:6,1'])->name('verify.email');

        // OAuth redirect & callback
        Route::get('/oauth/{provider}', [OAuthController::class, 'redirect'])->name('oauth.redirect');
        Route::get('/oauth/{provider}/callback', [OAuthController::class, 'callback'])->name('oauth.callback');
    });

    // ─── Public read routes ─────────────────────────────────────────
    Route::get('/games', [GameController::class, 'index'])->name('games.index');
    Route::post('/games', [GameController::class, 'store'])->name('games.store');
    Route::get('/games/{slug}', [GameController::class, 'show'])->name('games.show');
    Route::get('/news', [NewsController::class, 'index'])->name('news.index');
    Route::post('/news', [NewsController::class, 'store'])->name('news.store');
    Route::get('/news/{slug}', [NewsController::class, 'show'])->name('news.show');
    Route::get('/hashtags/{hashtag}', [HashtagController::class, 'show'])->name('hashtags.show');
    Route::get('/hashtags/trending', [HashtagController::class, 'trending'])->name('hashtags.trending');

    // Groups & Communities
    Route::get('/groups', [GroupController::class, 'index'])->name('groups.index');
    Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
    Route::get('/groups/{slug}', [GroupController::class, 'show'])->name('groups.show');
    Route::post('/groups/{group}/join', [GroupController::class, 'join'])->name('groups.join');
    Route::post('/groups/{group}/leave', [GroupController::class, 'leave'])->name('groups.leave');

    // Public feed tabs, explore, stories, and posting (open to all gamers)
    Route::get('/feed', [FeedController::class, 'index'])->name('feed.index');
    Route::get('/feed/explore', [FeedController::class, 'explore'])->name('feed.explore');
    Route::get('/feed/trending', [FeedController::class, 'trending'])->name('feed.trending');
    Route::get('/feed/following', [FeedController::class, 'following'])->name('feed.following');
    Route::get('/feed/friends', [FeedController::class, 'friends'])->name('feed.friends');
    Route::get('/feed/gaming', [FeedController::class, 'gaming'])->name('feed.gaming');
    Route::get('/feed/latest', [FeedController::class, 'latest'])->name('feed.latest');
    Route::get('/stories', [StoryController::class, 'index'])->name('stories.public_index');
    Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
    Route::post('/posts', [PostController::class, 'store'])->name('posts.public_store');
    Route::post('/posts/{post}/react', [ReactionController::class, 'reactToPost'])->name('posts.react');
    Route::delete('/posts/{post}/react', [ReactionController::class, 'unreactPost'])->name('posts.unreact');
    Route::post('/posts/{post}/save', [PostController::class, 'save'])->name('posts.save');
    Route::delete('/posts/{post}/save', [PostController::class, 'unsave'])->name('posts.unsave');
    Route::get('/posts/{post}/comments', [CommentController::class, 'index'])->name('posts.comments.index');
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::post('/stories', [StoryController::class, 'store'])->name('stories.public_store');

    // Public user profiles & discovery
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/me', [UserController::class, 'me'])->name('me.public');
    Route::put('/me', [UserController::class, 'update'])->name('me.update.public');
    Route::get('/users/{username}', [UserController::class, 'show'])->name('users.show');
    Route::get('/users/{username}/posts', [UserController::class, 'posts'])->name('users.posts');
    Route::get('/users/{username}/games', [UserController::class, 'games'])->name('users.games');
    Route::get('/users/{username}/friends', [UserController::class, 'friends'])->name('users.friends');
    Route::get('/users/{username}/achievements', [AchievementController::class, 'userAchievements'])->name('users.achievements');
    Route::post('/users/{user}/follow', [FollowController::class, 'follow'])->name('users.follow.public');
    Route::delete('/users/{user}/follow', [FollowController::class, 'unfollow'])->name('users.unfollow.public');
    // Notifications (supports authenticated users and demo user fallback)
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/send-test', [NotificationController::class, 'sendTest'])->name('notifications.test');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read.all');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.count');
    Route::put('/notifications/preferences', [NotificationController::class, 'updatePreferences'])->name('notifications.preferences');

    // Videos (public discovery & interaction with demo user fallback)
    Route::get('/videos', [VideoController::class, 'index'])->name('videos.index');
    Route::get('/videos/{video}', [VideoController::class, 'show'])->name('videos.show');
    Route::post('/videos', [VideoController::class, 'store'])->name('videos.store');
    Route::post('/videos/{video}/like', [VideoController::class, 'like'])->name('videos.like');
    Route::post('/videos/{video}/view', [VideoController::class, 'recordView'])->name('videos.view');

    // Reels (public discovery & interaction with demo user fallback)
    Route::get('/reels', [ReelController::class, 'index'])->name('reels.index');
    Route::get('/reels/{reel}', [ReelController::class, 'show'])->name('reels.show');
    Route::post('/reels', [ReelController::class, 'store'])->name('reels.store');
    Route::post('/reels/{reel}/like', [ReelController::class, 'like'])->name('reels.like');
    Route::post('/reels/{reel}/view', [ReelController::class, 'recordView'])->name('reels.view');

    // Tournaments (public discovery, registration, and brackets with demo fallback)
    Route::get('/tournaments', [TournamentController::class, 'index'])->name('tournaments.index');
    Route::get('/tournaments/my', [TournamentController::class, 'myTournaments'])->name('tournaments.my');
    Route::get('/tournaments/{tournament}', [TournamentController::class, 'show'])->name('tournaments.show');
    Route::get('/tournaments/{tournament}/bracket', [TournamentController::class, 'bracket'])->name('tournaments.bracket');
    Route::get('/tournaments/{tournament}/participants', [TournamentController::class, 'participants'])->name('tournaments.participants');
    Route::post('/tournaments', [TournamentController::class, 'store'])->name('tournaments.store');
    Route::post('/tournaments/{tournament}/register', [TournamentController::class, 'register'])->name('tournaments.register');
    Route::delete('/tournaments/{tournament}/register', [TournamentController::class, 'unregister'])->name('tournaments.unregister');

    // ─── Authenticated routes ───────────────────────────────────────
    Route::middleware(['auth:sanctum'])->group(function () {

        // Auth management
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('/logout', [LogoutController::class, 'logout'])->name('logout');
            Route::post('/logout-all', [LogoutController::class, 'logoutAll'])->name('logout.all');
            Route::post('/email/resend', [EmailVerificationController::class, 'resend'])->name('verify.resend');
            Route::get('/sessions', [SessionController::class, 'index'])->name('sessions.index');
            Route::delete('/sessions/{id}', [SessionController::class, 'destroy'])->name('sessions.destroy');

            // 2FA
            Route::post('/2fa/enable', [TwoFactorController::class, 'enable'])->name('2fa.enable');
            Route::post('/2fa/confirm', [TwoFactorController::class, 'confirm'])->name('2fa.confirm');
            Route::post('/2fa/disable', [TwoFactorController::class, 'disable'])->name('2fa.disable');
            Route::post('/2fa/verify', [TwoFactorController::class, 'verify'])->name('2fa.verify');
            Route::get('/2fa/recovery-codes', [TwoFactorController::class, 'recoveryCodes'])->name('2fa.recovery');

            // Connected OAuth accounts
            Route::get('/connected-accounts', [OAuthController::class, 'connectedAccounts'])->name('oauth.connected');
            Route::delete('/connected-accounts/{id}', [OAuthController::class, 'disconnect'])->name('oauth.disconnect');
        });

        // Posts extra actions
        Route::post('/posts/{post}/share', [PostController::class, 'share'])->name('posts.share');
        Route::get('/saved-posts', [PostController::class, 'savedPosts'])->name('posts.saved');
        Route::post('/posts/{post}/bookmark', [\App\Http\Controllers\Api\V1\BookmarkController::class, 'toggle'])->name('posts.bookmark.toggle');
        Route::get('/bookmarks', [\App\Http\Controllers\Api\V1\BookmarkController::class, 'index'])->name('bookmarks.index');
        Route::put('/comments/{comment}', [CommentController::class, 'update'])->name('comments.update');
        Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
        Route::post('/comments/{comment}/react', [ReactionController::class, 'reactToComment'])->name('comments.react');

        // Follow
        Route::get('/users/{username}/followers', [FollowController::class, 'followers'])->name('users.followers');
        Route::get('/users/{username}/following', [FollowController::class, 'following'])->name('users.following');

        // Friends
        Route::post('/users/{user}/friend-request', [FriendController::class, 'sendRequest'])->name('friends.request');
        Route::post('/friend-requests/{friendship}/accept', [FriendController::class, 'accept'])->name('friends.accept');
        Route::delete('/friend-requests/{friendship}/reject', [FriendController::class, 'reject'])->name('friends.reject');
        Route::delete('/friends/{user}', [FriendController::class, 'remove'])->name('friends.remove');
        Route::get('/friends', [FriendController::class, 'index'])->name('friends.index');
        Route::get('/friend-requests', [FriendController::class, 'requests'])->name('friends.requests');
        Route::get('/friend-suggestions', [FriendController::class, 'suggestions'])->name('friends.suggestions');

        // Block / Mute
        Route::post('/users/{user}/block', [BlockController::class, 'block'])->name('users.block');
        Route::delete('/users/{user}/block', [BlockController::class, 'unblock'])->name('users.unblock');
        Route::get('/blocked-users', [BlockController::class, 'index'])->name('blocked.index');
        Route::post('/users/{user}/mute', [BlockController::class, 'mute'])->name('users.mute');
        Route::delete('/users/{user}/mute', [BlockController::class, 'unmute'])->name('users.unmute');

        // Stories
        Route::get('/stories/{story}', [StoryController::class, 'show'])->name('stories.show');
        Route::delete('/stories/{story}', [StoryController::class, 'destroy'])->name('stories.destroy');
        Route::post('/stories/{story}/view', [StoryController::class, 'recordView'])->name('stories.view');
        Route::post('/stories/{story}/reply', [StoryController::class, 'reply'])->name('stories.reply');
        Route::get('/my-stories', [StoryController::class, 'myStories'])->name('stories.mine');

        // Reels (author management)
        Route::delete('/reels/{reel}', [ReelController::class, 'destroy'])->name('reels.destroy');

        // Videos (author management)
        Route::put('/videos/{video}', [VideoController::class, 'update'])->name('videos.update');
        Route::delete('/videos/{video}', [VideoController::class, 'destroy'])->name('videos.destroy');

        // Games (authenticated extras)
        Route::get('/game-recommendations', [GameController::class, 'recommendations'])->name('games.recommendations');
        Route::get('/games/trending', [GameController::class, 'trending'])->name('games.trending');

        // User game library
        Route::get('/my-games', [UserGameController::class, 'index'])->name('user.games.index');
        Route::post('/my-games', [UserGameController::class, 'store'])->name('user.games.store');
        Route::put('/my-games/{userGame}', [UserGameController::class, 'update'])->name('user.games.update');
        Route::delete('/my-games/{userGame}', [UserGameController::class, 'destroy'])->name('user.games.destroy');
        Route::post('/my-games/reorder', [UserGameController::class, 'reorder'])->name('user.games.reorder');

        // Groups (authenticated extras)
        Route::put('/groups/{group}', [GroupController::class, 'update'])->name('groups.update');
        Route::delete('/groups/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
        Route::delete('/groups/{group}/leave', [GroupController::class, 'leave'])->name('groups.leave');
        Route::get('/groups/{group}/members', [GroupController::class, 'members'])->name('groups.members');
        Route::post('/groups/{group}/invite', [GroupController::class, 'invite'])->name('groups.invite');
        Route::post('/groups/{group}/members/{user}/approve', [GroupController::class, 'approveMember'])->name('groups.members.approve');
        Route::delete('/groups/{group}/members/{user}', [GroupController::class, 'removeMember'])->name('groups.members.remove');
        Route::put('/groups/{group}/members/{user}/role', [GroupController::class, 'updateRole'])->name('groups.members.role');
        Route::get('/groups/{group}/posts', [GroupController::class, 'posts'])->name('groups.posts');
        Route::post('/groups/{group}/posts', [GroupController::class, 'createPost'])->name('groups.posts.create');
        Route::get('/my-groups', [GroupController::class, 'myGroups'])->name('groups.mine');

        // News (authenticated extras)
        Route::post('/news/{article}/save', [NewsController::class, 'save'])->name('news.save');
        Route::delete('/news/{article}/save', [NewsController::class, 'unsave'])->name('news.unsave');
        Route::get('/saved-news', [NewsController::class, 'savedArticles'])->name('news.saved');

        // Conversations / Messenger
        Route::get('/conversations', [ConversationController::class, 'index'])->name('conversations.index');
        Route::post('/conversations', [ConversationController::class, 'store'])->name('conversations.store');
        Route::get('/conversations/{conversation}', [ConversationController::class, 'show'])->name('conversations.show');
        Route::post('/conversations/{conversation}/read', [ConversationController::class, 'markRead'])->name('conversations.read');
        Route::post('/conversations/{conversation}/typing', [ConversationController::class, 'typing'])->name('conversations.typing');
        Route::delete('/conversations/{conversation}', [ConversationController::class, 'destroy'])->name('conversations.destroy');
        Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index'])->name('messages.index');
        Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store'])->name('messages.store')
            ->middleware('throttle.uploads');
        Route::get('/messages/conversations', [MessageController::class, 'conversations'])->name('messages.conversations');
        Route::get('/messages/{user_id}', [MessageController::class, 'history'])->name('messages.history');
        Route::post('/messages/{user_id}', [MessageController::class, 'send'])->name('messages.send');
        Route::post('/messages/{message}/read', [MessageController::class, 'markAsRead'])->name('messages.read');
        
        // Voice/Video Calls
        Route::post('/calls/token', [CallController::class, 'generateToken'])->name('calls.token');

        Route::put('/messages/{message}', [MessageController::class, 'update'])->name('messages.update');
        Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
        Route::post('/messages/{message}/react', [MessageController::class, 'react'])->name('messages.react');
        Route::post('/messages/{message}/forward', [MessageController::class, 'forward'])->name('messages.forward');

        // Tournaments (host / match management)
        Route::post('/tournaments/{tournament}/check-in', [TournamentController::class, 'checkIn'])->name('tournaments.checkin');
        Route::post('/tournaments/{tournament}/matches/{match}/result', [TournamentController::class, 'submitResult'])->name('tournaments.match.result');
        Route::post('/tournaments/{tournament}/generate-brackets', [TournamentController::class, 'generateBrackets'])->name('tournaments.generate-brackets');

        // Search
        Route::get('/search', [SearchController::class, 'index'])->name('search.index');
        Route::get('/search/users', [SearchController::class, 'users'])->name('search.users');
        Route::get('/search/games', [SearchController::class, 'games'])->name('search.games');
        Route::get('/search/groups', [SearchController::class, 'groups'])->name('search.groups');
        Route::get('/search/posts', [SearchController::class, 'posts'])->name('search.posts');
        Route::get('/search/news', [SearchController::class, 'news'])->name('search.news');
        Route::get('/search/tournaments', [SearchController::class, 'tournaments'])->name('search.tournaments');
        Route::get('/search/hashtags', [SearchController::class, 'hashtags'])->name('search.hashtags');

        // Reports
        Route::post('/reports', [ReportController::class, 'store'])->name('reports.store')
            ->middleware('throttle:10,60');

        // Achievements
        Route::get('/achievements', [AchievementController::class, 'index'])->name('achievements.index');

        // Settings
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile');
        Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
        Route::put('/settings/privacy', [SettingsController::class, 'updatePrivacy'])->name('settings.privacy');
        Route::put('/settings/notifications', [SettingsController::class, 'updateNotifications'])->name('settings.notifications');
        Route::put('/settings/account', [SettingsController::class, 'updateAccount'])->name('settings.account');
        Route::delete('/settings/account', [SettingsController::class, 'deleteAccount'])->name('settings.account.delete');

        // File uploads (presigned URL flow)
        Route::post('/upload/image', [UploadController::class, 'image'])->name('upload.image')
            ->middleware('throttle.uploads');
        Route::post('/upload/video', [UploadController::class, 'video'])->name('upload.video')
            ->middleware('throttle.uploads');
        Route::post('/upload/audio', [UploadController::class, 'audio'])->name('upload.audio')
            ->middleware('throttle.uploads');

        // ─── Admin routes ───────────────────────────────────────────
        Route::prefix('admin')->name('admin.')->middleware(['admin', 'permission:access-admin'])->group(function () {
            Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
            Route::get('/analytics', [AdminAnalyticsController::class, 'index'])->name('analytics');
            Route::get('/analytics/users', [AdminAnalyticsController::class, 'users'])->name('analytics.users');
            Route::get('/analytics/content', [AdminAnalyticsController::class, 'content'])->name('analytics.content');
            Route::get('/analytics/engagement', [AdminAnalyticsController::class, 'engagement'])->name('analytics.engagement');

            // User management
            Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
            Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('users.show');
            Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('users.update');
            Route::post('/users/{user}/ban', [AdminUserController::class, 'ban'])->name('users.ban');
            Route::post('/users/{user}/unban', [AdminUserController::class, 'unban'])->name('users.unban');
            Route::post('/users/{user}/verify', [AdminUserController::class, 'verify'])->name('users.verify');
            Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

            // Content moderation
            Route::get('/posts', [AdminPostController::class, 'index'])->name('posts.index');
            Route::delete('/posts/{post}', [AdminPostController::class, 'destroy'])->name('posts.destroy');
            Route::post('/posts/{post}/approve', [AdminPostController::class, 'approve'])->name('posts.approve');
            Route::post('/posts/{post}/hide', [AdminPostController::class, 'hide'])->name('posts.hide');

            // Reports & Moderation
            Route::get('/reports', [AdminReportController::class, 'index'])->name('reports.index');
            Route::get('/reports/{report}', [AdminReportController::class, 'show'])->name('reports.show');
            Route::post('/reports/{report}/resolve', [AdminReportController::class, 'resolve'])->name('reports.resolve');
            Route::post('/reports/{report}/dismiss', [AdminReportController::class, 'dismiss'])->name('reports.dismiss');
            Route::get('/moderation/queue', [AdminModerationController::class, 'queue'])->name('moderation.queue');

            // Games
            Route::apiResource('games', AdminGameController::class)->except(['show']);
            Route::post('/games/{game}/platforms', [AdminGameController::class, 'syncPlatforms'])->name('games.platforms');
            Route::post('/games/{game}/genres', [AdminGameController::class, 'syncGenres'])->name('games.genres');
            Route::post('/games/{game}/store-links', [AdminGameController::class, 'storeLinks'])->name('games.links');

            // News
            Route::get('/news/sources', [AdminNewsController::class, 'sources'])->name('news.sources');
            Route::post('/news/sources', [AdminNewsController::class, 'createSource'])->name('news.sources.create');
            Route::put('/news/sources/{source}', [AdminNewsController::class, 'updateSource'])->name('news.sources.update');
            Route::delete('/news/sources/{source}', [AdminNewsController::class, 'deleteSource'])->name('news.sources.delete');
            Route::post('/news/fetch', [AdminNewsController::class, 'triggerFetch'])->name('news.fetch');
            Route::get('/news/articles', [AdminNewsController::class, 'articles'])->name('news.articles');
            Route::put('/news/articles/{article}', [AdminNewsController::class, 'updateArticle'])->name('news.articles.update');
            Route::post('/news/articles/{article}/publish', [AdminNewsController::class, 'publish'])->name('news.articles.publish');
            Route::delete('/news/articles/{article}', [AdminNewsController::class, 'deleteArticle'])->name('news.articles.delete');

            // Groups
            Route::get('/groups', [AdminGroupController::class, 'index'])->name('groups.index');
            Route::delete('/groups/{group}', [AdminGroupController::class, 'destroy'])->name('groups.destroy');

            // Tournaments
            Route::get('/tournaments', [AdminTournamentController::class, 'index'])->name('tournaments.index');
            Route::post('/tournaments/{tournament}/feature', [AdminTournamentController::class, 'feature'])->name('tournaments.feature');

            // Audit Logs
            Route::get('/audit-logs', [AdminAuditLogController::class, 'index'])->name('audit_logs.index');
            Route::get('/audit-logs/{auditLog}', [AdminAuditLogController::class, 'show'])->name('audit_logs.show');
        });
    });
});
