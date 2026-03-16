<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller implements HasMiddleware
{
    /*
    Create a new AuthController instance.
    a middleware to protect all routes except login and register
    */
    public static function middleware(): array
    {
        return [
            new Middleware('auth:api', except: ['login', 'register', 'googleLogin']),
        ];
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (! $token = auth()->guard('api')->attempt($validator->validated())) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $this->createNewToken($token);
    }

    /**
     * Register a User.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|between:2,100',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::create(array_merge(
            $validator->validated(),
            ['password' => Hash::make($request->password)]
        ));

        return response()->json([
            'message' => 'User successfully registered',
            'user' => $user
        ], 201);
    }

    /**
     * Log the user out (Invalidate the token).
     */
    public function logout()
    {
        auth()->guard('api')->logout();

        return response()->json(['message' => 'User successfully signed out']);
    }

    /**
     * Refresh a token.
     */
    public function refresh()
    {
        return $this->createNewToken(auth()->guard('api')->refresh());
    }

    /**
     * Get the authenticated User.
     */
    public function me()
    {
        return response()->json(auth()->guard('api')->user());
    }

    /**
     * Get the token array structure.
     */
    protected function createNewToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->guard('api')->factory()->getTTL() * 60,
            'user' => auth()->guard('api')->user()
        ]);
    }

    /**
     * Handle Google API logic
     */
    public function googleLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'access_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        try {
            // Get user details from Google using the access token
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->access_token);

            // Find or create the user in our database
            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'password' => null // No password needed for social login
                ]
            );

            // Update google_id if it's a previously registered user who is now signing in with Google
            if (!$user->google_id) {
                $user->update(['google_id' => $googleUser->getId()]);
            }

            // Generate our own JWT token for the user
            $token = auth()->guard('api')->login($user);

            return $this->createNewToken($token);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid or expired Google token', 'message' => $e->getMessage()], 401);
        }
    }
}
