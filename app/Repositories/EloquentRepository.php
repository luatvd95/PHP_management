<?php
namespace App\Repositories;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Container\Container as App;

abstract class EloquentRepository implements RepositoryInterface
{
    protected $model;

    abstract public function model();

    public function __construct()
    {
        $this->app = new App();
        $this->makeModel();
    }
    
    public function makeModel()
    {
        $model = $this->app->make($this->model());
        if (!$model instanceof Model) {
            throw new Exception("Class {$this->model()} must be an instance of Illuminate\\Database\\Eloquent\\Model");
        }
        
        return $this->model = $model;
    }

    public function find($id)
    {
        try {
            return $this->model->findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $exception) {
            return response()->json(['message' => config('api.notfound')]);
        }
    }
    
    public function update($data, $id)
    {
        try {
            $workspace = $this->model->findOrFail($id);
            $workspace->update($data);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $exception) {
            return response()->json(['message' => config('api.notfound')]);
        } catch (\Exception $exception) {
            return response()->json($exception);
        }

        return response()->json(['message' => config('api.update')]);
    }

    public function create($data)
    {
        try {
            $this->model->create($data);

            return response()->json(['message' => config('api.create')]);
        } catch (Exception $exception) {
            return response()->json($exception);
        }
    }
}
