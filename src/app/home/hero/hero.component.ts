import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {

  constructor() { }

  currentSlide:any = 0;
  totalSlides:number;
  slides: any[] = [
    "assets/img/1.png",
    "assets/img/2.jpg",
    "assets/img/3.jpg",
    "assets/img/4.jpg",
    "assets/img/5.jpg",
  ]
  
  ngOnInit(): void {
    setTimeout(() => {
      this.next();
    }, 0);
    this.carouselAutoPlay(true);
  }

  carouselAutoPlay(state:boolean,timer:number = 4000) {
    let carousel;
    if (state) {
      carousel = setInterval(()=>{
        this.next();
      },timer)
    } else {
      clearInterval(carousel)
    }
  }

  next() {
    var next = this.currentSlide;
    this.currentSlide = this.currentSlide + 1;
    this.setSlide(next, this.currentSlide);
  }

  prev() {
    var prev = this.currentSlide;
    this.currentSlide = this.currentSlide - 1;
    this.setSlide(prev, this.currentSlide);
  }

  setSlide(prev:any, next:any){
    this.totalSlides = $('.carousel-item').length;
    var slide= this.currentSlide;
    if(next>this.totalSlides-1){
      slide = 0;
      this.currentSlide = 0;
    }
    if(next<0){
      slide = this.totalSlides - 1;
      this.currentSlide = this.totalSlides - 1;
    }
    $('.carousel-item').eq(prev).removeClass('active');
    $('.carousel-item').eq(slide).addClass('active');
  }

}
