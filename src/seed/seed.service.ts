import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interface/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;
  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ){
    
  }

  async executeSeed(){
    await this.pokemonModel.deleteMany({});
    const {data}= await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    // const insertPromiseArray=[];
    const pokemonToInsert:{name: string, no:number}[]=[];


    data.results.forEach(({name, url})=>{
      const segments = url.split('/');
      const no:number = +segments[ segments.length - 2]
      // insertPromiseArray.push(
      //   this.pokemonModel.create({name, nro})
      // )
      // const pokemon = await this.pokemonModel.create({name, nro});
      // console.log({name, nro});
      pokemonToInsert.push({name, no});
    })

    // await Promise.all(insertPromiseArray);
    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'seed execute';
    // return 'Execute Seed';
  }
}
