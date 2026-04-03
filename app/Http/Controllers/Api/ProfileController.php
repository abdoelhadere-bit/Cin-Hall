<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{

    public function update(Request $request)
    {
        $user = auth()->guard('api')->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|between:2,100',
            'email' => 'sometimes|string|email|max:100|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $dataToUpdate = $validator->validated();

        if (isset($dataToUpdate['password'])) {
            $dataToUpdate['password'] = Hash::make($dataToUpdate['password']);
        }

        $user->update($dataToUpdate);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }


    public function destroy()
    {
        $user = auth()->guard('api')->user();

        $user->delete();

        auth()->guard('api')->logout();

        return response()->json([
            'message' => 'Account deleted successfully'
        ]);
    }
}
