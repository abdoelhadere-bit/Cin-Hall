<?php

namespace App\Http\Controllers;

use App\Models\Film;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FilmController extends Controller
{
    /**
     * Display a listing of the films.
     */
    public function index(): JsonResponse
    {
        $films = Film::all();
        return response()->json($films);
    }

    /**
     * Display the specified film.
     */
    public function show($id): JsonResponse
    {
        $film = Film::with('seances')->findOrFail($id);
        return response()->json($film);
    }

    /**
     * Store a newly created film in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string',
            'duration' => 'required|integer',
            'genre' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'minimum_age' => 'nullable|integer',
            'trailer_url' => 'nullable|string',
        ]);

        $film = Film::create($data);

        return response()->json($film, 201);
    }

    /**
     * Update the specified film in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $film = Film::findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string',
            'duration' => 'required|integer',
            'genre' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'minimum_age' => 'nullable|integer',
            'trailer_url' => 'nullable|string',
        ]);

        $film->update($data);

        return response()->json($film);
    }

    /**
     * Remove the specified film from storage.
     */
    public function destroy($id): JsonResponse
    {
        $film = Film::findOrFail($id);
        $film->delete();

        return response()->json(null, 204);
    }
}
