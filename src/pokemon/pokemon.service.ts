import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private defaultLimit: number;

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ){
    this.defaultLimit=this.configService.get<number>('default_limit');
    // console.log(defaultLimit);
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);  
      return pokemon;
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(paginationDto:PaginationDto) {
  
    const{limit = this.defaultLimit, offset=0}= paginationDto;
    return this.pokemonModel.find().limit(limit).skip(offset).sort({no:1}).select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    //MongoID
    if ( !pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()});
    }

    if (!pokemon) throw new NotFoundException(`Pokemon with id. name or no ${term} not found`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name)
      updatePokemonDto.name= UpdatePokemonDto.name.toLocaleLowerCase();
    // const pokemonDB  = await pokemon.updateOne(updatePokemonDto, {new: true});
    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      // if(error.code === 11000) throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify(error.keyValue)}`);
      // throw new InternalServerErrorException(`Can't created Pokemon - Check server logs`);
      this.handleException(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // if(pokemon){
    //   await pokemon.deleteOne()
    // }
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if (deletedCount===0)throw new BadRequestException(`Pokemon with id "${id}" not found`);
    return;
  }

  private handleException(error: any){
    if(error.code === 11000) throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify(error.keyValue)}`);
      throw new InternalServerErrorException(`Can't created Pokemon - Check server logs`);
  }

}
