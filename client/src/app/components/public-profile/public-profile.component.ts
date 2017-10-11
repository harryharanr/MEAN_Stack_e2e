import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router,ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent implements OnInit {

  constructor(
    private authService:AuthService,
    private activatedRoute:ActivatedRoute
  ) { }

  ngOnInit() {
  }

}
